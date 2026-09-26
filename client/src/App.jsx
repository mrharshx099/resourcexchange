import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Toast from './components/Toast';
import CompareDrawer from './components/CompareDrawer';
import CompareModal from './components/CompareModal';
import SendRequestModal from './components/SendRequestModal';
import CounterOfferModal from './components/CounterOfferModal';
import ReviewModal from './components/ReviewModal';
import PostRequirementModal from './components/PostRequirementModal';
import ListingFormModal from './components/ListingFormModal';

// Pages
import LandingPage from './pages/LandingPage';
import SeekerExplorePage from './pages/SeekerExplorePage';
import ResourceDetailPage from './pages/ResourceDetailPage';
import ProviderDashboard from './pages/ProviderDashboard';
import SeekerRequestsPage from './pages/SeekerRequestsPage';
import RequirementsBoardPage from './pages/RequirementsBoardPage';
import BusinessProfilePage from './pages/BusinessProfilePage';
import AnalyticsPage from './pages/AnalyticsPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ErrorBoundary from './components/ErrorBoundary';

import { Sparkles, Repeat, ShieldCheck, HeartHandshake } from 'lucide-react';

export default function App() {
  const { activeRole, setActiveRole, currentUser, isAuthenticated, addToast } = useAuth();

  // Navigation page state - defaults to landing page
  const [activePage, setActivePage] = useState('landing'); 
  // 'landing' | 'explore' | 'detail' | 'seeker_requests' | 'provider_dashboard' | 'provider_requests' | 'analytics' | 'requirements' | 'profile' | 'login' | 'signup'
  
  const [selectedResourceId, setSelectedResourceId] = useState(null);

  // Modals state
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isSendRequestOpen, setIsSendRequestOpen] = useState(false);
  const [requestTargetResource, setRequestTargetResource] = useState(null);
  const [isPostReqOpen, setIsPostReqOpen] = useState(false);
  const [isListingFormOpen, setIsListingFormOpen] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [isCounterOpen, setIsCounterOpen] = useState(false);
  const [counterTargetRequest, setCounterTargetRequest] = useState(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewTargetRequest, setReviewTargetRequest] = useState(null);

  // Protected route check
  const navigateWithAuth = (targetPage) => {
    const protectedPages = ['seeker_requests', 'provider_dashboard', 'provider_requests', 'profile', 'analytics'];
    if (protectedPages.includes(targetPage) && !isAuthenticated) {
      addToast('Please log in or select a demo business account to access this page', 'info');
      setActivePage('login');
      return;
    }
    setActivePage(targetPage);
  };

  // Handlers
  const handleSelectResource = (resource) => {
    setSelectedResourceId(resource.id);
    setActivePage('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRequestResource = (resource) => {
    if (!isAuthenticated) {
      addToast('Please log in to send booking requests', 'info');
      setActivePage('login');
      return;
    }
    setRequestTargetResource(resource);
    setIsSendRequestOpen(true);
  };

  const handleOpenEditListing = (resource) => {
    setEditingResource(resource);
    setIsListingFormOpen(true);
  };

  const handleOpenAddListing = () => {
    if (!isAuthenticated) {
      addToast('Please log in or select a demo account to list hospitality resources', 'info');
      setActivePage('login');
      return;
    }
    setEditingResource(null);
    setIsListingFormOpen(true);
  };

  const handleOpenPostReq = () => {
    if (!isAuthenticated) {
      addToast('Please log in to broadcast requirements to the wanted board', 'info');
      setActivePage('login');
      return;
    }
    setIsPostReqOpen(true);
  };

  const handleOpenCounterOffer = (req) => {
    setCounterTargetRequest(req);
    setIsCounterOpen(true);
  };

  const handleOpenReview = (req) => {
    setReviewTargetRequest(req);
    setIsReviewOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Toast Notification Container */}
      <Toast />

      {/* Main Top Navigation Header */}
      <Navbar
        activePage={activePage}
        setActivePage={navigateWithAuth}
        onOpenPostReq={handleOpenPostReq}
        onOpenAddListing={handleOpenAddListing}
      />

      {/* Main Page Content Body */}
      <main className="flex-1 pb-24">
        <ErrorBoundary onNavigateHome={() => setActivePage('landing')}>
        {activePage === 'landing' && (
          <LandingPage
            onGetStarted={() => setActivePage('signup')}
            onTryDemo={() => setActivePage('login')}
            onExplore={() => setActivePage('explore')}
            onExploreCatalog={() => setActivePage('explore')}
          />
        )}

        {activePage === 'login' && (
          <LoginPage
            onNavigateSignup={() => setActivePage('signup')}
            onSuccessLogin={() => setActivePage('explore')}
          />
        )}

        {activePage === 'signup' && (
          <SignupPage
            onNavigateLogin={() => setActivePage('login')}
            onSuccessSignup={() => setActivePage('explore')}
          />
        )}

        {activePage === 'explore' && (
          <SeekerExplorePage
            onSelectResource={handleSelectResource}
            onRequestResource={handleRequestResource}
            onOpenPostReq={handleOpenPostReq}
          />
        )}

        {activePage === 'detail' && (
          <ResourceDetailPage
            resourceId={selectedResourceId}
            onBack={() => setActivePage('explore')}
            onRequestResource={handleRequestResource}
          />
        )}

        {activePage === 'seeker_requests' && (
          <SeekerRequestsPage
            onOpenReviewModal={handleOpenReview}
            onExploreMore={() => setActivePage('explore')}
          />
        )}

        {activePage === 'provider_dashboard' && (
          <ProviderDashboard
            initialTab="listings"
            onOpenAddListing={handleOpenAddListing}
            onOpenEditListing={handleOpenEditListing}
            onOpenCounterOffer={handleOpenCounterOffer}
            onNavigate={(page) => setActivePage(page)}
          />
        )}

        {activePage === 'provider_requests' && (
          <ProviderDashboard
            initialTab="requests"
            onOpenAddListing={handleOpenAddListing}
            onOpenEditListing={handleOpenEditListing}
            onOpenCounterOffer={handleOpenCounterOffer}
            onNavigate={(page) => setActivePage(page)}
          />
        )}

        {activePage === 'analytics' && (
          <AnalyticsPage
            onNavigate={(page) => setActivePage(page)}
          />
        )}

        {activePage === 'requirements' && (
          <RequirementsBoardPage
            onOpenPostReq={handleOpenPostReq}
            onBrowseToMatch={() => setActivePage('explore')}
          />
        )}

        {activePage === 'profile' && (
          <BusinessProfilePage
            onSelectResource={handleSelectResource}
          />
        )}
        </ErrorBoundary>
      </main>

      {/* Floating Bottom Comparison Drawer (if resources are added) */}
      <CompareDrawer
        onOpenCompareModal={() => setIsCompareOpen(true)}
      />

      {/* Side-by-Side Comparison Modal */}
      <CompareModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        onRequestResource={handleRequestResource}
      />

      {/* Send Booking Request Modal */}
      <SendRequestModal
        resource={requestTargetResource}
        isOpen={isSendRequestOpen}
        onClose={() => {
          setIsSendRequestOpen(false);
          setRequestTargetResource(null);
        }}
        onSuccess={() => {
          setActivePage('seeker_requests');
        }}
      />

      {/* Post Requirement (Wanted Board RFQ) Modal */}
      <PostRequirementModal
        isOpen={isPostReqOpen}
        onClose={() => setIsPostReqOpen(false)}
        onSuccess={() => {
          setActivePage('requirements');
        }}
      />

      {/* Add / Edit Resource Listing Modal */}
      <ListingFormModal
        resource={editingResource}
        isOpen={isListingFormOpen}
        onClose={() => {
          setIsListingFormOpen(false);
          setEditingResource(null);
        }}
        onSuccess={() => {
          setActiveRole('provider');
          setActivePage('provider_dashboard');
        }}
      />

      {/* Counter-Offer Modal */}
      <CounterOfferModal
        request={counterTargetRequest}
        isOpen={isCounterOpen}
        onClose={() => {
          setIsCounterOpen(false);
          setCounterTargetRequest(null);
        }}
        onSuccess={() => {
          setActivePage('provider_requests');
        }}
      />

      {/* Review Modal */}
      <ReviewModal
        request={reviewTargetRequest}
        isOpen={isReviewOpen}
        onClose={() => {
          setIsReviewOpen(false);
          setReviewTargetRequest(null);
        }}
        onSuccess={() => {
          setActivePage('seeker_requests');
        }}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Repeat className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-700 dark:text-slate-300">ResourceXchange</span>
            <span>— Hospitality Asset Sharing Platform</span>
          </div>

          <div className="flex items-center gap-6">
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">✓ Conflict-Free Calendar Guarantee</span>
            <span className="text-teal-600 dark:text-teal-400 font-medium">✓ Haversine Distance Scored</span>
            <span className="text-amber-600 dark:text-amber-400 font-medium">✓ Verified Hospitality Network</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
