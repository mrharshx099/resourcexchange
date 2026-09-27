import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import { NugenClient } from '../src/services/nugenClient.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Allow API key from command line arg or environment
const apiKeyArg = process.argv[2];
const apiKey = apiKeyArg || process.env.NUGEN_API_KEY;

if (!apiKey || apiKey.trim() === '') {
  console.error('\n❌ ERROR: NUGEN_API_KEY is required.');
  console.error('Usage:');
  console.error('  node server/scripts/setup-nugen-alignment.js <YOUR_NUGEN_API_KEY>');
  console.error('  OR set NUGEN_API_KEY in server/.env or shell environment\n');
  process.exit(1);
}

const client = new NugenClient(apiKey);
const corpusDir = path.resolve(__dirname, '../domain-corpus');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('=====================================================');
  console.log(' ResourceXchange — Nugen Domain Alignment Setup');
  console.log('=====================================================\n');

  // Step 1: Read domain corpus files
  if (!fs.existsSync(corpusDir)) {
    throw new Error(`Domain corpus directory not found at: ${corpusDir}`);
  }

  const corpusFiles = fs.readdirSync(corpusDir).filter(f => f.endsWith('.txt') || f.endsWith('.md'));
  if (corpusFiles.length === 0) {
    throw new Error(`No corpus documents found in ${corpusDir}`);
  }

  console.log(`📁 Found ${corpusFiles.length} domain corpus documents:`);
  corpusFiles.forEach(f => console.log(`   - ${f}`));
  console.log('\n--- Step 1: Uploading documents to Nugen Intelligence ---');

  const documentIds = [];

  for (const filename of corpusFiles) {
    const filePath = path.join(corpusDir, filename);
    const content = fs.readFileSync(filePath, 'utf-8');
    process.stdout.write(`   Uploading ${filename}... `);

    try {
      const uploadRes = await client.uploadDocuments([
        { name: filename, content }
      ], ['hospitality-resource-exchange']);

      const ids = uploadRes.document_ids || (uploadRes.documents ? uploadRes.documents.map(d => d.id || d) : []);
      if (ids.length > 0) {
        documentIds.push(...ids);
        console.log(`✅ Uploaded -> ID(s): ${ids.join(', ')}`);
      } else {
        console.log(`⚠️ Response did not contain document_ids:`, uploadRes);
      }
    } catch (err) {
      console.error(`❌ Failed to upload ${filename}:`, err.message);
      throw err;
    }
  }

  console.log(`\n📄 Total uploaded document IDs (${documentIds.length}):`);
  documentIds.forEach(id => console.log(`   • ${id}`));

  // Step 2: Poll document status until READY
  console.log('\n--- Step 2: Verifying document processing statuses ---');
  for (const docId of documentIds) {
    let ready = false;
    let attempts = 0;
    while (!ready && attempts < 15) {
      attempts++;
      try {
        const statusRes = await client.getDocumentStatus(docId);
        const status = statusRes.status || statusRes;
        if (status === 'READY') {
          ready = true;
          console.log(`   Document ${docId}: READY`);
        } else if (status === 'FAILED') {
          throw new Error(`Document ${docId} processing failed.`);
        } else {
          process.stdout.write(`   Document ${docId} is ${status}... waiting (attempt ${attempts}/15)\r`);
          await sleep(3000);
        }
      } catch (err) {
        // If status endpoint returns 404 or isn't strictly required before alignment, log and proceed
        console.log(`   Document ${docId} status check: ${err.message}`);
        ready = true;
      }
    }
  }

  // Step 3: Create domain alignment project
  console.log('\n--- Step 3: Creating Domain Alignment Project ---');
  const alignmentPayload = {
    alignment_name: 'ResourceXchange Hospitality Domain Alignment',
    base_model_id: 'qwen-v2p5-0p5b-instruct',
    document_ids: documentIds,
    description: 'Domain alignment for hospitality B2B resource matching and negotiation',
  };

  console.log('Sending alignment creation request:');
  console.log(JSON.stringify(alignmentPayload, null, 2));

  const alignmentRes = await client.createAlignmentProject(alignmentPayload);
  const alignmentId = alignmentRes.alignment_id;

  if (!alignmentId) {
    throw new Error(`Failed to obtain alignment_id. Response: ${JSON.stringify(alignmentRes)}`);
  }

  console.log(`\n🎉 Alignment project created!`);
  console.log(`   Alignment ID: ${alignmentId}`);
  console.log(`   Initial Status: ${alignmentRes.status || 'PROCESSING'}`);

  // Step 4: Poll alignment project status every 15-20 seconds
  console.log('\n--- Step 4: Polling Alignment Status (every 15-20s) ---');
  let finalStatus = alignmentRes.status || 'PROCESSING';
  let pollCount = 0;
  const startTime = Date.now();

  while (finalStatus === 'PROCESSING' || finalStatus === 'QUEUED') {
    pollCount++;
    await sleep(18000); // 18 seconds interval
    
    try {
      const statusRes = await client.getAlignmentStatus(alignmentId);
      finalStatus = statusRes.status;
      const elapsedMin = ((Date.now() - startTime) / 60000).toFixed(1);
      const queueInfo = statusRes.queue_position ? ` | Queue Pos: ${statusRes.queue_position}` : '';
      const earlyInfo = statusRes.early_deployable ? ' | Early Deployable: YES' : '';
      
      console.log(`   [Poll #${pollCount} - ${elapsedMin}m elapsed] Status: ${finalStatus}${queueInfo}${earlyInfo}`);
    } catch (pollErr) {
      console.warn(`   ⚠️ Status check error (retrying): ${pollErr.message}`);
    }
  }

  console.log(`\n🏁 Alignment run finished with status: ${finalStatus}`);

  if (finalStatus !== 'READY' && finalStatus !== 'COMPLETED' && finalStatus !== 'EVALUATED') {
    try {
      const projectDetails = await client.getAlignmentProject(alignmentId);
      console.error('Project Details:', JSON.stringify(projectDetails, null, 2));
    } catch (_) {}
    throw new Error(`Alignment failed or stopped with status: ${finalStatus}`);
  }

  // Step 5: Deploy the aligned model
  console.log('\n--- Step 5: Deploying Aligned Model ---');
  console.log(`Deploying model for alignment ID: ${alignmentId}...`);

  let deployedModelId = alignmentId;
  let deployStatus = 'DEPLOYING';

  try {
    const deployRes = await client.deployModel(alignmentId);
    console.log('Deploy Response:', JSON.stringify(deployRes));
    deployedModelId = deployRes.model_id || alignmentId;
  } catch (deployErr) {
    if (deployErr.status === 400 && deployErr.message?.includes('already deployed')) {
      console.log('Model is already deployed.');
      deployStatus = 'DEPLOYED';
    } else {
      console.warn(`Initial deploy call notice: ${deployErr.message}`);
    }
  }

  // Poll deployment status
  let deployAttempts = 0;
  while (deployStatus === 'DEPLOYING' && deployAttempts < 30) {
    deployAttempts++;
    console.log(`   Checking deployment status (attempt #${deployAttempts})...`);
    await sleep(15000);
    try {
      const depCheck = await client.getDeploymentStatus(deployedModelId);
      deployStatus = depCheck.status;
      console.log(`   Deployment Status: ${deployStatus}`);
      if (depCheck.error) {
        console.error(`   Deployment Error Detail: ${depCheck.error}`);
      }
    } catch (checkErr) {
      console.warn(`   Could not check deployment status: ${checkErr.message}`);
      break;
    }
  }

  // Step 6: Summary and writing configuration
  console.log('\n=====================================================');
  console.log(' 🚀 NUGEN DOMAIN ALIGNMENT COMPLETE!');
  console.log('=====================================================');
  console.log(` Alignment ID:           ${alignmentId}`);
  console.log(` Final Status:           ${finalStatus}`);
  console.log(` Deployed Model ID:      ${deployedModelId}`);
  console.log(` Deployment State:       ${deployStatus}`);
  console.log('=====================================================\n');

  // Update or append to server/.env if file exists or create it
  const envPath = path.resolve(__dirname, '../.env');
  let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf-8') : '';

  if (!envContent.includes('NUGEN_API_KEY=')) {
    envContent += `\nNUGEN_API_KEY=${apiKey}\n`;
  } else {
    envContent = envContent.replace(/NUGEN_API_KEY=.*/g, `NUGEN_API_KEY=${apiKey}`);
  }

  if (!envContent.includes('NUGEN_ALIGNED_MODEL_ID=')) {
    envContent += `NUGEN_ALIGNED_MODEL_ID=${deployedModelId}\n`;
  } else {
    envContent = envContent.replace(/NUGEN_ALIGNED_MODEL_ID=.*/g, `NUGEN_ALIGNED_MODEL_ID=${deployedModelId}`);
  }

  fs.writeFileSync(envPath, envContent.trim() + '\n', 'utf-8');
  console.log(`💾 Saved NUGEN_API_KEY and NUGEN_ALIGNED_MODEL_ID to server/.env`);

  console.log('\n📢 ACTION REQUIRED FOR PRODUCTION / RAILWAY:');
  console.log('Add the following environment variables to your Railway dashboard:');
  console.log(`   NUGEN_API_KEY=${apiKey}`);
  console.log(`   NUGEN_ALIGNED_MODEL_ID=${deployedModelId}\n`);
}

main().catch(err => {
  console.error('\n❌ Fatal alignment setup error:', err);
  process.exit(1);
});
