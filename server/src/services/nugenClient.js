import 'dotenv/config';

const NUGEN_BASE_URL = 'https://api.nugen.in';

export class NugenClient {
  constructor(apiKey = process.env.NUGEN_API_KEY, baseUrl = NUGEN_BASE_URL) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl.replace(/\/+$/, '');
  }

  getHeaders(extraHeaders = {}) {
    const headers = { ...extraHeaders };
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey.trim()}`;
    }
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    const headers = this.getHeaders(options.headers || {});
    
    // Auto-set application/json if body is not FormData
    if (options.body && !(options.body instanceof FormData) && typeof options.body === 'object') {
      headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(options.body);
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const isJson = response.headers.get('content-type')?.includes('application/json');
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      const errMsg = typeof data === 'object' && data !== null
        ? data.error || data.detail || data.message || JSON.stringify(data)
        : data;
      const error = new Error(`Nugen API error (${response.status}): ${errMsg}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  }

  /**
   * Upload multiple plain-text / markdown documents.
   * @param {Array<{ name: string, content: string | Buffer }>} files
   * @param {string[]} [categories]
   */
  async uploadDocuments(files, categories = []) {
    const form = new FormData();
    for (const f of files) {
      const blob = new Blob([f.content], { type: 'text/plain' });
      form.append('files', blob, f.name);
    }
    for (const cat of categories) {
      form.append('categories', cat);
    }

    return this.request('/api/v3/documents/create', {
      method: 'POST',
      body: form,
    });
  }

  /**
   * Check status of a single document
   */
  async getDocumentStatus(documentId) {
    return this.request(`/api/v3/documents/${documentId}/status`, {
      method: 'GET',
    });
  }

  /**
   * Create a domain alignment project
   */
  async createAlignmentProject({
    alignment_name,
    base_model_id = 'qwen-v2p5-0p5b-instruct',
    document_ids,
    description = '',
    benchmark_id = undefined,
  }) {
    const payload = {
      alignment_name,
      base_model_id,
      document_ids,
      description,
    };
    if (benchmark_id) payload.benchmark_id = benchmark_id;

    return this.request('/api/v3/alignment-projects/create', {
      method: 'POST',
      body: payload,
    });
  }

  /**
   * Poll status of an alignment project (PROCESSING, READY, FAILED, etc.)
   */
  async getAlignmentStatus(alignmentId) {
    return this.request(`/api/v3/alignment-projects/${alignmentId}/status`, {
      method: 'GET',
    });
  }

  /**
   * Get full details of an alignment project
   */
  async getAlignmentProject(alignmentId) {
    return this.request(`/api/v3/alignment-projects/${alignmentId}`, {
      method: 'GET',
    });
  }

  /**
   * Deploy an aligned model for inference
   */
  async deployModel(modelId, early = false) {
    const url = `/api/v3/models/${modelId}/deployment${early ? '?early=true' : ''}`;
    return this.request(url, {
      method: 'POST',
    });
  }

  /**
   * Check deployment status (UNDEPLOYED, DEPLOYING, DEPLOYED, FAILED)
   */
  async getDeploymentStatus(modelId) {
    return this.request(`/api/v3/models/${modelId}/deployment/status`, {
      method: 'GET',
    });
  }

  /**
   * List all domain-aligned models
   */
  async listAlignedModels(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/api/v3/models/aligned${query ? `?${query}` : ''}`, {
      method: 'GET',
    });
  }

  /**
   * Generate Chat Completions using aligned model
   */
  async generateChatCompletions({
    model,
    messages,
    max_tokens = 300,
    temperature = 0.3,
  }) {
    return this.request('/api/v3/inference/chat/completions', {
      method: 'POST',
      body: {
        model,
        messages,
        max_tokens,
        temperature,
        stream: false,
      },
    });
  }
}

export const nugenClient = new NugenClient();
export default nugenClient;
