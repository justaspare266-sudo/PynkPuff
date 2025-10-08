'use client';

import { ImageGridBlockData, ImageGridItem, isBlockType, ImageBlockData, HeaderBlockData, ActivePanelType, AnimatedImageData } from '@/types/email-editor'; // Added ImageGridItem, ActivePanelType, AnimatedImageData
import { useRouter, useSearchParams } from 'next/navigation'; // Import useRouter
import React, { useState, useCallback, ReactElement, useEffect, useRef, Suspense } from 'react'; // Added React, useEffect, useRef
import dynamic from 'next/dynamic';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from 'react-resizable-panels';
import { useToast } from '@/hooks/use-toast';
import { SettingsPanel } from '@/components/email-generator/SettingsPanel';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from '@/components/ui/button';
import {
  EditorBlock,
  BlockDataType,
  BlockType,
} from '@/types/email-editor'; // ActivePanelType is already imported above
import { v4 as uuidv4 } from 'uuid';
import { produce } from 'immer';
import JSZip from 'jszip';
import { AVAILABLE_BLOCKS } from '@/components/email-generator/available-blocks';
import { getInitialBlocks } from '@/lib/initial-blocks';
import { EditorToolbar } from '@/components/email-generator/EditorToolbar';
import { ProductSearchSlider } from '@/components/email-generator/ProductSearchSlider';

import { parseHtmlToBlocks } from '@/lib/htmlParser';
import { UrlDirectoryPanel } from '@/components/email-generator/UrlDirectoryPanel'; // Import the new panel
// import { AiAssistantPanel } from '@/components/email-generator/AiAssistantPanel'; // Import the new AI panel - removed
import EmailCanvas from '@/components/email-generator/EmailCanvas';
import { CampaignHeaderFields } from '@/components/email-generator/CampaignHeaderFields';
import { generateEmailHTML } from '@/lib/emailExporter'; // Import for export
import { CollectionPreview } from '@/components/CollectionPreview';
// import { generateAndUploadThumbnail } from '@/lib/thumbnailGenerator'; // Import for thumbnail generation
// import type { ImageEditorSourceData, EditableImageData } from '@/components/email-generator/ImageEditorModal'; // Replaced with PolotnoStudioModal
import { GifEditorModal } from '@/components/email-generator/GifEditorModal'; // Import GIF Editor Modal

// Define ImageEditorSourceData type for compatibility
type ImageEditorSourceData = {
  blockId: string;
  imageIndex?: number;
  frameIndex?: number;
  imageUrl: string;
};

import type { Product, ProductSwatch } from '@/types/product';
import { Info } from 'lucide-react';

// Define the swatch type locally for the page
type ProductSwatchType = ProductSwatch;

// Dynamically import PolotnoStudioModal to prevent SSR issues with canvas
const PolotnoStudioModal = dynamic(() => import('@/components/email-generator/PolotnoStudioModal'), { 
  ssr: false,
  loading: () => <div className="flex items-center justify-center p-8">Loading image editor...</div>
});

const Toaster = dynamic(() => import('@/components/ui/toaster').then(mod => mod.Toaster), { ssr: false });

// Canvas-dependent components are now dynamically imported above
import { db, auth } from '@/lib/firebase'; // Import Firebase db and auth
import { doc, setDoc, serverTimestamp, FieldValue, getDoc, deleteDoc, onSnapshot } from 'firebase/firestore'; // Import Firestore functions, Add FieldValue and getDoc
import { onAuthStateChanged, User, signOut } from 'firebase/auth'; // Import auth state change and signOut
import { CollaborativeCursors } from '@/components/collaboration/CollaborativeCursors';
import { BlockSynchronizer } from '@/components/collaboration/BlockSynchronizer';
import { RoomSharing } from '@/components/collaboration/RoomSharing';
const MeetingOverlay = dynamic(() => import('@/components/email-generator/MeetingOverlay'), { ssr: false });
import { CollaborationToggle } from '@/components/collaboration/CollaborationToggle';
const MeetingChat = dynamic(() => import('@/components/email-generator/MeetingChat'), { ssr: false });
import { useActiveUsers } from '@/hooks/useActiveUsers';
import QuickBubbles from '@/components/collaboration/QuickBubbles';
import CursorSettings from '@/components/collaboration/CursorSettings';
import { CollaboratorsDisplay } from '@/components/collaboration/CollaboratorsDisplay';
import CompactMeetingChat from '@/components/email-generator/CompactMeetingChat';
import { RoomInfoModal } from '@/components/collaboration/RoomInfoModal';
import { Eye } from 'lucide-react';

// Utility to clear Next.js cache in development
const clearNextCache = () => {
  if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
    // Clear Next.js chunk cache
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          if (name.includes('_next')) {
            caches.delete(name);
          }
        });
      });
    }
  }
};

// Simple Error Boundary for dynamic imports
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode; onRetry?: () => void },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode; onRetry?: () => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false });
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-center">
          <div className="text-red-500 mb-2">Failed to load image editor</div>
          <button 
            onClick={this.handleRetry}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}




// Helper to generate a safe filename from a URL
const generateSafeFilename = (url: string): string => {
  try {
    // Use URL constructor for robust parsing
    const urlObject = new URL(url);
    const pathname = urlObject.pathname;
    // Get the last part of the path
    let filename = pathname.substring(pathname.lastIndexOf('/') + 1) || 'image';

    // Ensure it has a file extension, default to .jpg
    if (!/\.[^/.]+$/.test(filename)) {
      filename += '.jpg';
    }
    return filename;
  } catch (e) {
    // Fallback for invalid or relative URLs that can't be parsed by new URL()
    const urlWithoutQuery = url.split('?')[0];
    let filename = urlWithoutQuery.substring(urlWithoutQuery.lastIndexOf('/') + 1) || 'image';
    if (!/\.[^/.]+$/.test(filename)) {
      filename += '.jpg';
    }
    return filename;
  }
};

// Helper for deep comparison to avoid JSON.stringify issues with key order
const deepEqual = (a: any, b: any): boolean => {
  if (a === b) return true;

  if (a && b && typeof a === 'object' && typeof b === 'object') {
    if (Array.isArray(a) !== Array.isArray(b)) return false;

    if (Array.isArray(a)) {
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) {
        if (!deepEqual(a[i], b[i])) return false;
      }
      return true;
    }

    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) return false;

    for (const key of keysA) {
      if (!keysB.includes(key) || !deepEqual(a[key], b[key])) {
        return false;
      }
    }

    return true;
  }

  return a === b;
};

function EmailEditorContent() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomIdFromUrl = searchParams.get('room');
  const roomId = roomIdFromUrl || `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const initialBlocksSnapshot = getInitialBlocks();
  const [blocks, setBlocks] = useState<EditorBlock[]>(initialBlocksSnapshot);
  const [history, setHistory] = useState<EditorBlock[][]>([initialBlocksSnapshot]);
  const [historyPointer, setHistoryPointer] = useState<number>(0);
  const [selectedBlockState, setSelectedBlockState] = useState<{ block: EditorBlock | null; element: HTMLElement | null }>({ block: null, element: null });
  const [editingBlock, setEditingBlock] = useState<EditorBlock | null>(null); // State for block being edited in settings
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>(
    'desktop',
  );
  const [activePanel, setActivePanel] = useState<ActivePanelType>(
    null,
  );
  const [zoom, setZoom] = useState(1);
  const [isProductSearchSliderOpen, setIsProductSearchSliderOpen] = useState(false);


  // Temporary user type for development
  interface TempUser {
    uid: string;
    email?: string;
    displayName?: string;
  }
  
  const [currentUser, setCurrentUser] = useState<TempUser | null>(null);
  const [currentEmailId, setCurrentEmailId] = useState<string>(roomId); // Use the roomId from URL params
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isRemoteChange = useRef(false); // Ref to prevent feedback loop
  const [isImageEditorOpen, setIsImageEditorOpen] = useState(false);
  const [imageToEdit, setImageToEdit] = useState<{ blockId: string; imageIndex?: number; frameIndex?: number; imageUrl: string } | null>(null);
  const [isGifEditorOpen, setIsGifEditorOpen] = useState(false);
  const [gifSourceData, setGifSourceData] = useState<{ blockId: string; currentData: AnimatedImageData } | null>(null);
  const [collaborationEnabled, setCollaborationEnabled] = useState(true);
  const activeUsers = useActiveUsers(roomId, collaborationEnabled);
  const [isDataLoaded, setIsDataLoaded] = useState(false); // State to track if initial data load is complete
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [callbackCount, setCallbackCount] = useState(0);
  const [isMeetingOpen, setIsMeetingOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isCursorSettingsOpen, setIsCursorSettingsOpen] = useState(false);
  const [isRoomInfoOpen, setIsRoomInfoOpen] = useState(false);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [showCollections, setShowCollections] = useState(false);
  // Canvas-only comments (not exported)
  const [comments, setComments] = useState<{ id: string; blockId: string; text: string; resolved?: boolean }[]>([]);

  // Helper function to check if any modal is open (excludes sidebars)
  const isAnyModalOpen = isImageEditorOpen || isGifEditorOpen || isMeetingOpen || isChatOpen || isCursorSettingsOpen || isRoomInfoOpen;
  
  // Helper function to check if any sidebar is open
  const isAnySidebarOpen = isProductSearchSliderOpen;

  // Sync activePanel with ProductSearchSlider
  useEffect(() => {
    setIsProductSearchSliderOpen(activePanel === 'products');
  }, [activePanel]);



  // State for Campaign Information
  const [campaignName, setCampaignName] = useState('');
  const [campaignSummary, setCampaignSummary] = useState('');
  const [sendDate, setSendDate] = useState('');
  const [subjectLine, setSubjectLine] = useState('');
  const [preheader, setPreheader] = useState('');

  // Effect for Firebase Authentication with view-only support
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const ownerIdParam = urlParams.get('ownerId');
    const viewOnly = urlParams.get('view') === 'true';
    
    const setupUser = async () => {
      try {
        // Import Firebase Auth
        const { auth } = await import('@/lib/firebase');
        const { onAuthStateChanged } = await import('firebase/auth');
        
        // Listen for authentication state changes
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          if (user) {
            console.log('✅ Firebase user authenticated:', { 
              uid: user.uid, 
              email: user.email, 
              displayName: user.displayName 
            });
            
            setCurrentUser({ 
              uid: user.uid,
              email: user.email || undefined,
              displayName: user.displayName || undefined
            });
            
            // Update URL with the authenticated user ID if not already set
            if (!ownerIdParam) {
              const newUrl = new URL(window.location.href);
              newUrl.searchParams.set('ownerId', user.uid);
              window.history.replaceState({}, '', newUrl.toString());
            }
          } else if (viewOnly) {
            // Allow view-only access without authentication
            console.log('👁️ View-only mode - no authentication required');
            setCurrentUser(null);
            setIsViewOnly(true);
          } else {
            console.log('❌ No Firebase user authenticated, redirecting to login');
            const currentUrl = encodeURIComponent(window.location.href);
            window.location.href = `/login?redirect=${currentUrl}`;
          }
        });
        
        return () => unsubscribe();
      } catch (error) {
        console.error('❌ Firebase authentication error:', error);
        if (viewOnly) {
          console.log('👁️ View-only mode - continuing without authentication');
          setCurrentUser(null);
          setIsViewOnly(true);
        } else {
          const currentUrl = encodeURIComponent(window.location.href);
          window.location.href = `/login?redirect=${currentUrl}`;
        }
      }
    };
    
    setupUser();
  }, []);

  const handleGridItemSwap = (blockId: string, sourceIndex: number, destinationIndex: number) => {
    const updatedBlocks = produce(blocks, (draft) => {
      const block = draft.find((b) => b.id === blockId);
      if (block && block.type === BlockType.ImageGrid) {
        const gridData = block.data as ImageGridBlockData;
        const newColumns = Array.from(gridData.columns);
        const [movedItem] = newColumns.splice(sourceIndex, 1);
        newColumns.splice(destinationIndex, 0, movedItem);
        gridData.columns = newColumns;
      }
    });
    updateBlocksAndHistory(updatedBlocks);
  };

  // Effect to load room data - PURE ROOM-BASED STATE
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const viewOnly = urlParams.get('view') === 'true';
    
    console.log('🔍 Room data loading effect triggered:', { 
      currentUser: !!currentUser, 
      isDataLoaded, 
      viewOnly 
    });
    
    // Allow loading in view-only mode even without currentUser
    if (!currentUser && !viewOnly) {
      setIsDataLoaded(false);
      return;
    }
    
    // Set view-only state
    setIsViewOnly(viewOnly);

    const startTime = performance.now();
    console.log('⏱️ Starting room data load...');

    const roomIdFromUrl = urlParams.get('room') || urlParams.get('emailId');
    const returnTo = urlParams.get('returnTo');

    if (!roomIdFromUrl) {
      console.log('❌ No room ID found in URL');
      setIsDataLoaded(true);
      return;
    }

    console.log('🏠 Loading room data for room:', roomIdFromUrl);
    setCurrentEmailId(roomIdFromUrl);
    console.log('🔗 Room ID set to:', roomIdFromUrl);
    
    // Update URL to ensure room ID is preserved
    if (typeof window !== 'undefined') {
      const currentUrl = new URL(window.location.href);
      if (!currentUrl.searchParams.has('room')) {
        currentUrl.searchParams.set('room', roomIdFromUrl);
        window.history.replaceState({}, '', currentUrl.toString());
        console.log('🔗 Updated URL with room ID:', roomIdFromUrl);
      }
    }
    
    // Set owner ID from URL param or current user
    const ownerIdFromUrl = urlParams.get('ownerId');
    if (ownerIdFromUrl) {
      setOwnerId(ownerIdFromUrl);
    } else if (currentUser) {
      setOwnerId(currentUser.uid);
    }

    // Load data from room-based Firebase storage
    const loadRoomData = async () => {
      try {
        const { db } = await import('@/lib/firebase');
        const { doc, getDoc } = await import('firebase/firestore');
        
        // Always use room-based collection
        const roomDocRef = doc(db, 'roomEmails', roomIdFromUrl);
        const roomDoc = await getDoc(roomDocRef);
        
        if (roomDoc.exists()) {
          const data = roomDoc.data();
          console.log('🏠 Loaded room data from Firebase:', data);
          
          if (data.blocks) {
            setBlocks(data.blocks);
            setCampaignName(data.campaignName || '');
            setCampaignSummary(data.campaignSummary || '');
            setSubjectLine(data.subjectLine || '');
            setPreheader(data.preheader || '');
            setSendDate(data.sendDate || '');
          }
        } else {
          console.log('🏠 No existing room data found, starting with defaults');
          // Initialize with default blocks for new rooms
          setBlocks(getInitialBlocks());
        }
        
        const loadTime = performance.now() - startTime;
        console.log('✅ Room data loaded in:', Math.round(loadTime) + 'ms');
        setIsDataLoaded(true);
        
        if (process.env.NODE_ENV === 'development') {
          toast({
            title: 'Room Loaded',
            description: `Ready in ${Math.round(loadTime)}ms`,
          });
        }
      } catch (error) {
        console.error('❌ Error loading room data from Firebase:', error);
        setIsDataLoaded(true);
        toast({
          title: 'Load Error',
          description: 'Could not load room data from Firebase',
          variant: 'destructive',
        });
      }
    };
    
    loadRoomData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, isDataLoaded]);



  // Save campaign metadata (subject line, pre-header, etc.) when it changes
  useEffect(() => {
    if (!currentEmailId || !isDataLoaded || currentEmailId === 'default_email_id') {
      return;
    }

    const saveCampaignData = async () => {
      try {
        const { db } = await import('@/lib/firebase');
        const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
        
        const roomEmailRef = doc(db, 'roomEmails', currentEmailId);
        await setDoc(roomEmailRef, {
          campaignName,
          subjectLine,
          preheader,
          sendDate,
          lastUpdatedBy: currentUser?.uid,
          lastUpdated: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }, { merge: true });
        
        console.log('💾 Campaign metadata saved:', { campaignName, subjectLine, preheader, sendDate });
      } catch (error) {
        console.error('Error saving campaign metadata:', error);
      }
    };

    // Debounce campaign data saves
    const timeoutId = setTimeout(saveCampaignData, 1000);
    return () => clearTimeout(timeoutId);
  }, [campaignName, subjectLine, preheader, sendDate, currentEmailId, isDataLoaded, currentUser?.uid]);



  // Add return to email planner button
  const handleReturnToPlanner = () => {
    if (typeof window === 'undefined') return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const returnTo = urlParams.get('returnTo');
    
    // Return to email planner if we have a room ID from URL (indicating we came from a campaign)
    if (roomIdFromUrl) {
      router.push('/email-planner');
    } else if (returnTo === 'campaign-planners') {
      router.push('/email-planner');
    }
  };

  // Generate and save thumbnail for email campaigns
  // DISABLED: Using real-time hover preview instead
  const generateThumbnail = async () => {
    console.log('🖼️ Thumbnail generation disabled - using real-time hover preview');
  };

  // Debounced save effect - TEMPORARILY DISABLED
  /* useEffect(() => {
    // Prevent auto-saving until the initial data has been loaded from Firestore.
    // This stops the initial/default state from overwriting your saved work on page load.
    if (!isDataLoaded) {
      return;
    }

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(async () => {
      console.log("[DEBUG Auto-Save] Timeout triggered. currentEmailId:", currentEmailId, "currentUser:", currentUser?.uid);
      if (!currentEmailId || currentEmailId === 'default_email_id') { // Also check for default
        console.log("[DEBUG Auto-Save] No valid currentEmailId, skipping auto-save.");
        return;
      }
      
      console.log(`[DEBUG Auto-Save] Attempting to auto-save email for currentEmailId: ${currentEmailId}`);
      // Step 1: Construct the raw data object that needs to be saved.
      const rawDataForSave = {
        blocks: blocks, // Use raw blocks from state; sanitization will happen next.
        campaignName,
        campaignSummary,
        sendDate,
        subjectLine,
        preheader,
        lastSaved: serverTimestamp(),
        userId: currentUser?.uid || 'anonymous',
      };

      // Step 2: Sanitize the entire data object before sending to Firestore.
      const finalDataForFirestore = sanitizeDataForFirestore(rawDataForSave);

      try {
        const emailDocRef = doc(db, 'userEmails', currentEmailId);
        await setDoc(emailDocRef, finalDataForFirestore, { merge: true });
        
        toast({
          title: 'Email Auto-Saved',
          description: 'Your changes have been automatically saved.',
        });
        console.log(`Email ${currentEmailId} auto-saved successfully.`);
      } catch (error) {
        console.error("Error auto-saving email:", error);
        toast({
          title: 'Auto-Save Failed',
          description: 'Could not automatically save your changes.',
          variant: 'destructive',
        });
      }
    }, 2000);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [isDataLoaded, blocks, campaignName, campaignSummary, sendDate, subjectLine, preheader, currentUser, currentEmailId, toast]); */

  const updateBlocksAndHistory = (newBlocksState: EditorBlock[]) => {
    console.log('🎯 updateBlocksAndHistory called:', { 
      oldBlocksLength: blocks.length, 
      newBlocksLength: newBlocksState.length,
      blocksChanged: blocks !== newBlocksState
    });
    
    const newHistoryStack = history.slice(0, historyPointer + 1);
    newHistoryStack.push(newBlocksState);

    setHistory(newHistoryStack);
    setHistoryPointer(newHistoryStack.length - 1);
    setBlocks(newBlocksState);
    // After a new action, reset selection and editing block to avoid stale data if IDs change
    // Or, if the selected/editing block still exists, re-select it from newBlocksState
    // For simplicity now, let's clear them.
    // Consider if this is the best UX, might be better to try and keep selection if possible.
    // setSelectedBlockState({ block: null, element: null });
    // setEditingBlock(null);
  };

  // const handleSignOut = async () => {
  //   try {
  //     await signOut(auth);
  //     toast({ title: "Signed Out", description: "You have been successfully signed out." });
  //     // The onAuthStateChanged listener will handle the redirect to /login
  //   } catch (error) {
  //     console.error("Error signing out:", error);
  //     toast({ title: "Sign Out Failed", description: "Could not sign you out.", variant: "destructive" });
  //   }
  // };

  const handleUndo = () => {
    if (historyPointer > 0) {
      const newPointer = historyPointer - 1;
      setHistoryPointer(newPointer);
      const newBlocksState = history[newPointer];
      setBlocks(newBlocksState); // This will trigger debounced save
      setSelectedBlockState({ block: null, element: null }); // Reset selection
      setEditingBlock(null); // Reset editing block
      toast({ title: "Undo Successful", description: "Last action has been undone." });
    }
  };

  const handleRedo = () => {
    if (historyPointer < history.length - 1) {
      const newPointer = historyPointer + 1;
      setHistoryPointer(newPointer);
      const newBlocksState = history[newPointer];
      setBlocks(newBlocksState); // This will trigger debounced save
      setSelectedBlockState({ block: null, element: null }); // Reset selection
      setEditingBlock(null); // Reset editing block
      toast({ title: "Redo Successful", description: "Last undone action has been redone." });
    }
  };
 
  const handleOpenImageEditor = (sourceData: ImageEditorSourceData) => {
    console.log('🎯 handleOpenImageEditor called with:', sourceData);
    console.log('🎯 handleOpenImageEditor - imageUrl:', sourceData.imageUrl);
    
    // More robust validation - check if we have any valid image source
    const hasValidSrc = sourceData.imageUrl && 
                       sourceData.imageUrl !== '' && 
                       sourceData.imageUrl !== 'undefined' &&
                       sourceData.imageUrl !== 'null';
    
    if (sourceData.imageUrl === "") {
      console.log("🎯 handleOpenImageEditor - Empty imageUrl detected, opening editor for upload");
      setImageToEdit(sourceData);
      setIsImageEditorOpen(true);
      return;
    }
    
    if (!hasValidSrc) {
      console.error('❌ handleOpenImageEditor: Missing or invalid image source in sourceData:', sourceData);
      toast({
        title: "Error",
        description: "No valid image source provided for editing. Please try uploading an image first.",
        variant: "destructive",
      });
      return;
    }
    
    console.log('🎯 handleOpenImageEditor - Valid image source found, opening editor');
    setImageToEdit(sourceData);
    setIsImageEditorOpen(true);
  };

  const handleCloseImageEditor = () => {
    setIsImageEditorOpen(false);
    setImageToEdit(null);
  };

  const handleSaveImageEditor = (imageDataUrl: string) => {
    if (!imageToEdit) return;
    
    const { blockId, imageIndex, frameIndex } = imageToEdit;

    const updatedBlocks = produce(blocks, draft => {
      const block = draft.find(b => b.id === blockId);
      if (!block) return;

      if (isBlockType(block, BlockType.Image)) {
        (block.data as ImageBlockData).src = imageDataUrl;
      } else if (isBlockType(block, BlockType.ImageGrid) && typeof imageIndex === 'number') {
        const gridData = block.data as ImageGridBlockData;
        const itemToUpdate = gridData.columns?.[imageIndex];
        
        if (itemToUpdate && itemToUpdate.type === 'product') {
          itemToUpdate.imageUrl = imageDataUrl;
        } else if (itemToUpdate && itemToUpdate.type === 'custom') {
          itemToUpdate.imageUrl = imageDataUrl;
        }
      } else if (isBlockType(block, BlockType.AnimatedImage) && typeof frameIndex === 'number') {
        const animData = block.data as AnimatedImageData;
        if (animData.sourceFrames[frameIndex]) {
          animData.sourceFrames[frameIndex].src = imageDataUrl;
        }
      }
    });
    updateBlocksAndHistory(updatedBlocks);
    handleCloseImageEditor();
  };

  const handleOpenGifEditor = (blockId: string, currentData: AnimatedImageData) => {
    setGifSourceData({ blockId, currentData });
    setIsGifEditorOpen(true);
  };

  const handleCloseGifEditor = () => {
    setIsGifEditorOpen(false);
    setGifSourceData(null);
  };

  const handleSaveGifEditor = (blockId: string, updatedData: Partial<AnimatedImageData>) => {
    const nextBlockState = produce(blocks, draft => {
      const block = draft.find(b => b.id === blockId);
      if (block && isBlockType(block, BlockType.AnimatedImage)) {
        // Merge updatedData into the existing block data
        block.data = { ...block.data, ...updatedData } as AnimatedImageData;
      }
    });
    updateBlocksAndHistory(nextBlockState);

    if (editingBlock && editingBlock.id === blockId) {
      const freshBlock = nextBlockState.find(b => b.id === blockId);
      setEditingBlock(freshBlock ? { ...freshBlock } : null);
    }

    toast({ title: "GIF Updated", description: "Your animated GIF has been updated." });
    handleCloseGifEditor();
  };


  const handleBlocksChange = (newBlocks: EditorBlock[]) => {
    updateBlocksAndHistory(newBlocks);
  };

  const handleSelectBlock = useCallback(
    (blockData: EditorBlock | null, element: HTMLElement | null) => {
      setSelectedBlockState({ block: blockData, element: element });
      setEditingBlock(blockData); // Set the block for editing but don't auto-open settings
      // Settings panel will only open when user clicks the settings cog specifically
    },
    [], // Removed setActivePanel dependency since we're not using it
  );

  const handleShowSettings = useCallback(
    (blockData: EditorBlock | null, element: HTMLElement | null) => {
      // First select the block
      setSelectedBlockState({ block: blockData, element: element });
      setEditingBlock(blockData);
      // Then open the settings panel
      setActivePanel('settings');
    },
    [],
  );

  const handleUpdateBlockSettings = (
    blockId: string,
    updatedData: Partial<BlockDataType>,
  ) => {
    console.log('🎯 handleUpdateBlockSettings called:', { blockId, updatedData });
    
    const newBlocksState = produce(blocks, (draft) => {
      const block = draft.find((b) => b.id === blockId);
      if (block) {
        // Merge updatedData into the existing block data
        const oldData = { ...block.data };
        block.data = { ...block.data, ...updatedData };
        console.log('🎯 Block data updated:', { 
          blockId, 
          oldData: oldData, 
          newData: block.data,
          fontSizeChanged: ('fontSize' in oldData && 'fontSize' in block.data) ? oldData.fontSize !== block.data.fontSize : false
        });

        // Obsolete logic for numberOfColumns has been removed as the new settings form handles row/column management.
      }
    });
    updateBlocksAndHistory(newBlocksState);
 
    // Update selectedBlockState and editingBlock using newBlocksState
    if (selectedBlockState.block && selectedBlockState.block.id === blockId) {
      const updatedSelectedBlockInArray = newBlocksState.find(b => b.id === blockId);
      if (updatedSelectedBlockInArray) {
        setSelectedBlockState(prevState => ({ ...prevState, block: updatedSelectedBlockInArray }));
      }
    }
    if (editingBlock && editingBlock.id === blockId) {
      const updatedEditingBlockInArray = newBlocksState.find(b => b.id === blockId);
      setEditingBlock(updatedEditingBlockInArray || null);
    }
  };
 
  const handleUpdateBlock = (updatedBlock: EditorBlock) => {
    const nextBlockState = produce(blocks, (draft: EditorBlock[]) => {
      const index = draft.findIndex((b: EditorBlock) => b.id === updatedBlock.id);
      if (index !== -1) {
        draft[index] = updatedBlock;
      }
    });
    updateBlocksAndHistory(nextBlockState);

    // Ensure selectedBlockState is also updated if the modified block is selected
    if (selectedBlockState.block && selectedBlockState.block.id === updatedBlock.id) {
      setSelectedBlockState(prevState => ({ ...prevState, block: updatedBlock }));
    }
    // If the block being edited is the one updated, update editingBlock as well
    if (editingBlock && editingBlock.id === updatedBlock.id) {
      setEditingBlock(updatedBlock);
    }
  };
 
  const handleAddBlock = (type: BlockType) => {
    const newBlock: EditorBlock = {
      id: uuidv4(),
      type,
      data: JSON.parse(JSON.stringify(AVAILABLE_BLOCKS.find((b) => b.type === type)?.defaultData || {})), // Deep copy default data
    };
    const nextBlockState = produce(blocks, (draft: EditorBlock[]) => {
      const footerIndex = draft.findIndex(b => b.type === BlockType.Footer);
      if (footerIndex !== -1) {
        draft.splice(footerIndex, 0, newBlock);
      } else {
        draft.push(newBlock);
      }
    });
    updateBlocksAndHistory(nextBlockState);
    handleSelectBlock(newBlock, null); // Pass null for element
    toast({
      title: 'Block Added',
      description: `A new ${type} block has been added to the canvas.`,
    });
  };
 
  const handleDuplicateBlock = (blockId: string) => {
    const blockToDuplicate = blocks.find((b) => b.id === blockId);
    if (blockToDuplicate) {
      const newBlock: EditorBlock = {
        ...JSON.parse(JSON.stringify(blockToDuplicate)), // Deep copy
        id: uuidv4(),
      };
      const index = blocks.findIndex((b) => b.id === blockId);
      const nextBlockState = produce(blocks, (draft: EditorBlock[]) => {
        draft.splice(index + 1, 0, newBlock);
      });
      updateBlocksAndHistory(nextBlockState);
      handleSelectBlock(newBlock, null); // Pass null for element
      toast({
        title: 'Block Duplicated',
        description: `The ${newBlock.type} block has been duplicated.`,
      });
    }
  };
 
  const handleDeleteBlock = (blockId: string) => {
    const nextBlockState = produce(blocks, (draft: EditorBlock[]) => {
      const index = draft.findIndex((b: EditorBlock) => b.id === blockId);
      if (index !== -1) {
        draft.splice(index, 1);
      }
    });
    updateBlocksAndHistory(nextBlockState);

    if (selectedBlockState.block?.id === blockId) {
      handleSelectBlock(null, null); // Pass null for element as well
      if (editingBlock?.id === blockId) {
        setEditingBlock(null); // Clear editing block if it was deleted
      }
    }
    toast({
      title: 'Block Deleted',
      description: 'The selected block has been removed from the canvas.',
      variant: 'destructive',
    });
  };

  // Keyboard shortcuts for block management
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if any modals are open - if so, don't handle background shortcuts
      // Note: Sidebars (ProductSearch, AmplienceSearch) are not considered modals
      if (isAnyModalOpen) {
        return; // Don't handle keyboard shortcuts when modals are open
      }

      // Only handle shortcuts when not typing in an input field or contenteditable
      if (event.target instanceof HTMLInputElement || 
          event.target instanceof HTMLTextAreaElement ||
          (event.target instanceof HTMLElement && event.target.contentEditable === 'true')) {
        return;
      }

      // Delete selected block with Delete key only (removed Backspace to avoid conflicts with text editing)
      if (event.key === 'Delete' && selectedBlockState.block) {
        event.preventDefault();
        handleDeleteBlock(selectedBlockState.block.id);
        toast({
          title: 'Block Deleted',
          description: 'Selected block has been deleted.',
          variant: 'destructive',
        });
      }

      // Duplicate selected block with Ctrl/Cmd + D
      if ((event.ctrlKey || event.metaKey) && event.key === 'd' && selectedBlockState.block) {
        event.preventDefault();
        handleDuplicateBlock(selectedBlockState.block.id);
        toast({
          title: 'Block Duplicated',
          description: 'Selected block has been duplicated.',
        });
      }

      // Undo with Ctrl/Cmd + Z
      if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey && historyPointer > 0) {
        event.preventDefault();
        handleUndo();
      }

      // Redo with Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y
      if ((event.ctrlKey || event.metaKey) && 
          ((event.key === 'z' && event.shiftKey) || event.key === 'y') && 
          historyPointer < history.length - 1) {
        event.preventDefault();
        handleRedo();
      }

      // Escape to deselect block
      if (event.key === 'Escape' && selectedBlockState.block) {
        event.preventDefault();
        setSelectedBlockState({ block: null, element: null });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedBlockState.block, handleDeleteBlock, handleDuplicateBlock, handleUndo, handleRedo, historyPointer, history.length, isAnyModalOpen]);
 
  const handleZoomIn = () => {
    setZoom((prevZoom) => Math.min(prevZoom + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoom((prevZoom) => Math.max(prevZoom - 0.1, 0.5));
  };

  const togglePanel = (panel: 'products' | 'settings' | 'urls' | 'ai') => {
    setActivePanel(activePanel === panel ? null : panel);
  };

  // const createFullHtmlDocument = (emailBodyHtml: string, title: string = 'Your Email') => {
  //   // Basic HTML structure for email
  //   // More complex templates would include responsive meta tags, style blocks for email clients, etc.
  //   return `
  // <!DOCTYPE html>
  // <html lang="en">
  // <head>
  //   <meta charset="UTF-8">
  //   <meta name="viewport" content="width=device-width, initial-scale=1.0">
  //   <title>${title}</title>
  //   <style>
  //     body { margin: 0; padding: 0; background-color: #f4f4f4; }
  //     .email-container { max-width: 650px; margin: auto; background-color: #ffffff; }
  //     /* Add more global email styles here if needed */
  //   </style>
  // </head>
  // <body>
  //   <div class="email-container">
  //     ${emailBodyHtml}
  //   </div>
  // </body>
  // </html>
  //   `.trim();
  // };

  const triggerDownload = (content: string | Blob, fileName: string, contentType: string) => {
    const a = document.createElement("a");
    const file = content instanceof Blob ? content : new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    document.body.appendChild(a); // Required for Firefox
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  };

  const extractImageUrls = (blocksToScan: EditorBlock[]): string[] => {
    const urls: string[] = [];
    blocksToScan.forEach(block => {
      if (isBlockType(block, BlockType.Image) && block.data.src) {
        urls.push(block.data.src);
      } else if (isBlockType(block, BlockType.ImageGrid)) {
        (block.data as ImageGridBlockData).columns?.forEach(col => {
          if (col.type === 'product' && col.imageUrl) {
            urls.push(col.imageUrl);
          }
        });
      } else if (isBlockType(block, BlockType.Header) && block.data.logoSrc) {
        urls.push(block.data.logoSrc);
      }
    });
    return Array.from(new Set(urls));
  };

  // Extract images in order with their position information for sequential numbering
  const extractImagesInOrder = (blocksToScan: EditorBlock[]): Array<{url: string, position: number}> => {
    const images: Array<{url: string, position: number}> = [];
    let position = 0;
    
    blocksToScan.forEach(block => {
      if (isBlockType(block, BlockType.Image) && block.data.src) {
        images.push({ url: block.data.src, position });
        position++;
      } else if (isBlockType(block, BlockType.ImageGrid)) {
        (block.data as ImageGridBlockData).columns?.forEach(col => {
          if (col.type === "product" && col.imageUrl) {
            images.push({ url: col.imageUrl, position });
            position++;
          } else if (col.type === "custom" && col.imageUrl) {
            images.push({ url: col.imageUrl, position });
            position++;
          }
        });
      } else if (isBlockType(block, BlockType.Header) && block.data.logoSrc) {
        images.push({ url: block.data.logoSrc, position });
        position++;
      }
    });
    
    // Remove duplicates while preserving order
    const seen = new Set<string>();
    return images.filter(img => {
      if (seen.has(img.url)) return false;
      seen.add(img.url);
      return true;
    });
  };
  const handleExport = async (type: 'html' | 'images' | 'html-images') => {
    if (blocks.length === 0) {
      toast({ title: "Cannot Export", description: "There are no blocks to export.", variant: "destructive" });
      return;
    }

    try {
      if (type === 'html') {
        const html = generateEmailHTML(blocks, preheader);
        triggerDownload(html, "email-export.html", "text/html");
        toast({ title: "Export Successful", description: "HTML file has been downloaded." });
        return;
      }
      const imagesInOrder = extractImagesInOrder(blocks);
      if (imagesInOrder.length === 0) {
        toast({ title: "No Images Found", description: "No images to export.", variant: "destructive" });
        return;
      }

      const zip = new JSZip();
      const imagesFolder = zip.folder("images");
      const localImagePaths: Record<string, string> = {};

      const imagePromises = imagesInOrder.map(async (imageData, index) => {
        try {
          const response = await fetch(imageData.url);
          if (!response.ok) return null;
          const blob = await response.blob();
          
          // Generate sequential filename with zero-padded number
          const originalFileName = generateSafeFilename(imageData.url);
          const namePart = originalFileName.includes(".") ? originalFileName.substring(0, originalFileName.lastIndexOf(".")) : originalFileName;
          const extPart = originalFileName.includes(".") ? originalFileName.substring(originalFileName.lastIndexOf(".")) : "";
          
          // Create sequential filename: 01_filename.ext, 02_filename.ext, etc.
          const sequentialNumber = String(index + 1).padStart(2, "0");
          const fileName = `${sequentialNumber}_${namePart}${extPart}`;

          imagesFolder?.file(fileName, blob);
          localImagePaths[imageData.url] = `images/${fileName}`;
          return { url: imageData.url, fileName };
        } catch (e) {
          return null;
        }
      });

      await Promise.all(imagePromises);

      if (type === 'html-images') {
        const blocksForHtmlExport = produce(blocks, draft => {
          draft.forEach(block => {
            if (isBlockType(block, BlockType.Image) && block.data.src && localImagePaths[block.data.src]) {
              (block.data as ImageBlockData).src = localImagePaths[block.data.src];
            } else if (isBlockType(block, BlockType.ImageGrid)) {
              const gridData = block.data as ImageGridBlockData;
              gridData.columns?.forEach(col => {
                if (col.type === 'product' && col.imageUrl && localImagePaths[col.imageUrl]) {
                  col.imageUrl = localImagePaths[col.imageUrl];
                }
              });
            } else if (isBlockType(block, BlockType.Header) && block.data.logoSrc && localImagePaths[block.data.logoSrc]) {
              (block.data as HeaderBlockData).logoSrc = localImagePaths[block.data.logoSrc];
            }
          });
        });
        zip.file('index.html', generateEmailHTML(blocksForHtmlExport, preheader));
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const fileName = type === 'images' ? 'email-images.zip' : 'email-html-images.zip';
      triggerDownload(zipBlob, fileName, 'application/zip');
      toast({ title: "Export Successful", description: `${fileName} has been downloaded.` });

    } catch (error) {
      console.error("Export error:", error);
      toast({ title: "Export Failed", description: "Could not generate export.", variant: "destructive" });
    }
  };

  const handleExportHtml = () => handleExport('html');
  const handleExportImagesOnly = () => handleExport('images');
  const handleExportHtmlAndImages = () => handleExport('html-images');
 
  const handleDeleteAllBlocks = () => {
    const headerBlock = blocks.find(b => b.type === BlockType.Header);
    const footerBlock = blocks.find(b => b.type === BlockType.Footer);
    const newBlocksState: EditorBlock[] = [];
    if (headerBlock) newBlocksState.push(headerBlock);
    if (footerBlock) newBlocksState.push(footerBlock);
 
    if (blocks.length === newBlocksState.length && blocks.every((b, i) => b.id === newBlocksState[i]?.id)) { // Only header/footer were present or canvas was empty
      toast({ title: "No Content Blocks", description: "There are no content blocks to delete." });
      return;
    }
 
    updateBlocksAndHistory(newBlocksState);
    handleSelectBlock(null, null); // Deselect any active block
    setEditingBlock(null); // Clear editing block as well
    toast({ title: "Content Blocks Deleted", description: "All content blocks have been cleared from the canvas." });
  };
 
  // Placeholder for Save Template
  const handleSaveTemplate = () => {
    toast({ title: "Save Template", description: "Save functionality not yet implemented." });
    console.log("Attempting to save template with blocks:", blocks);
  };
 
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [emailRecipients, setEmailRecipients] = useState('');

  const handleSendTestEmail = () => {
    // Pre-fill with user's email if available and recipients field is empty
    if (!emailRecipients && currentUser?.email) {
      setEmailRecipients(currentUser.email);
    }
    setShowEmailDialog(true);
  };

  const handleConfirmSendEmail = async () => {
    try {
      console.log('🚀 Sending email with:', { subjectLine, preheader });
      const html = generateEmailHTML(blocks, preheader);
      const recipients = emailRecipients.split(',').map(email => email.trim()).filter(email => email);
      // Try delegated Graph first only if explicitly enabled
      let delegatedToken: string | null = null;
      if (process.env.NEXT_PUBLIC_USE_GRAPH_DELEGATED === 'true') {
        try {
          const { acquireGraphToken } = await import('@/lib/msal');
          const tokenRes = await acquireGraphToken();
          delegatedToken = tokenRes.accessToken;
        } catch (e) {
          console.warn('MSAL delegated token not available, falling back if server is configured:', e);
        }
      }

      const res = await fetch('/api/send-test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: recipients,
          subject: subjectLine || 'Test Email from No1 Design',
          html,
          delegatedToken: delegatedToken || undefined,
        }),
      });
      const result = await res.json();
      if (result.success) {
        toast({ title: 'Test Email Sent', description: `Email sent to ${recipients.length} recipient(s)!` });
        setShowEmailDialog(false);
      } else {
        toast({ title: 'Send Failed', description: result.error || 'Failed to send email.', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Send Error', description: 'Error sending email.', variant: 'destructive' });
    }
  };

  const handleAddToEmail = (product: Product, selectedSwatch: ProductSwatchType | null, imageUrl: string) => {
    console.log('🎯 Adding product to email:', {
      productId: product.id,
      productTitle: product.titles?.default,
      extractedPrice: product.price,
      legacyPricing: product.pricing?.current,
      productUrl: product.url,
      imageUrl: imageUrl,
      fullProduct: product
    });

    if (!selectedBlockState.block || !isBlockType(selectedBlockState.block, BlockType.ImageGrid)) {
      toast({
        title: 'Select an Image Grid',
        description: 'Please select an image grid block first to add a product.',
        variant: 'destructive',
      });
      return;
    }

    const newBlocks = produce(blocks, draft => {
      const gridBlock = draft.find(b => b.id === selectedBlockState.block?.id);
      if (!gridBlock || !isBlockType(gridBlock, BlockType.ImageGrid)) return;

      const placeholderIndex = gridBlock.data.columns.findIndex(col => col.type === 'placeholder');

      if (placeholderIndex === -1) {
        toast({
          title: 'Grid is Full',
          description: 'The selected image grid has no empty slots.',
          variant: 'destructive',
        });
        return;
      }

      // Add website prefix to product URL if it's a relative path
      const fullProductUrl = product.url?.startsWith('/') 
        ? `https://www.lkbennett.com${product.url}` 
        : product.url;

      const newItem: ImageGridItem = {
        type: 'product',
        product: { ...product, url: fullProductUrl },
        imageUrl: imageUrl,
      };

      gridBlock.data.columns[placeholderIndex] = newItem;
    });

    updateBlocksAndHistory(newBlocks);
    toast({
      title: 'Product Added',
      description: `${product.titles.default} has been added to the grid.`,
    });
  };

  // Wrapper function for CollectionPreview component
  const handleAddToEmailWrapper = (data: { product: Product; selectedSwatch: ProductSwatchType | null; imageUrl: string }) => {
    const { product, selectedSwatch, imageUrl } = data;
    handleAddToEmail(product, selectedSwatch, imageUrl);
  };

  const handleAddAmplienceAssetToEmail = (asset: any, imageUrl: string) => {
    console.log('🖼️ Adding Amplience asset to email:', {
      assetId: asset.id,
      assetName: asset.name,
      imageUrl: imageUrl,
      fullAsset: asset
    });

    if (!selectedBlockState.block || !isBlockType(selectedBlockState.block, BlockType.ImageGrid)) {
      toast({
        title: 'Select an Image Grid',
        description: 'Please select an image grid block first to add an asset.',
        variant: 'destructive',
      });
      return;
    }

    const newBlocks = produce(blocks, draft => {
      const gridBlock = draft.find(b => b.id === selectedBlockState.block?.id);
      if (!gridBlock || !isBlockType(gridBlock, BlockType.ImageGrid)) return;

      // Find the first available slot (placeholder or empty slot)
      let targetIndex = -1;
      
      // First, try to find a placeholder slot
      targetIndex = gridBlock.data.columns.findIndex(col => col.type === 'placeholder');
      
      // If no placeholder found, find the first empty or replaceable slot
      if (targetIndex === -1) {
        targetIndex = gridBlock.data.columns.findIndex(col => 
          col.type === 'placeholder' || 
          (col.type === 'custom' && (!col.imageUrl || col.imageUrl.includes('placeholder')))
        );
      }
      
      // If still no slot found, use the first slot
      if (targetIndex === -1) {
        targetIndex = 0;
      }

      const newItem: ImageGridItem = {
        type: 'custom',
        imageUrl: imageUrl,
        altText: asset.name || asset.label,
        linkUrl: '', // No link for Amplience assets
      };

      gridBlock.data.columns[targetIndex] = newItem;
    });

    updateBlocksAndHistory(newBlocks);
    toast({
      title: 'Asset Added',
      description: `${asset.name} has been added to the grid.`,
    });
  };
 
  // Show loading screen with better UX feedback
  if (!isDataLoaded) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-lg text-gray-700 font-medium">Loading Email Editor...</p>
        <p className="text-sm text-gray-500 mt-2">
          {!currentUser ? 'Authenticating...' : 'Loading email data...'}
        </p>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      {/* View-only banner */}
      {isViewOnly && (
        <div className="bg-yellow-100 border-b border-yellow-300 px-4 py-2 text-center">
          <div className="flex items-center justify-center gap-2 text-yellow-800">
            <Eye className="h-4 w-4" />
            <span className="text-sm font-medium">View-only mode - You can see the content but cannot edit</span>
          </div>
        </div>
      )}
      
      <PanelGroup direction="horizontal" className="h-screen bg-white">
        {isProductSearchSliderOpen && (
          <>
            <Panel defaultSize={30} minSize={20} maxSize={40} collapsible={true} collapsedSize={0} id="product-search-panel" order={0}>
              <ProductSearchSlider 
                onAddToEmail={handleAddToEmail} 
                onAddAmplienceAssetToEmail={handleAddAmplienceAssetToEmail}
              />
            </Panel>
            <PanelResizeHandle className="w-2 bg-gray-200 hover:bg-gray-300 transition-colors" />
          </>
        )}

        {activePanel === 'settings' && !isViewOnly && (
          <>
            <Panel defaultSize={25} minSize={20} maxSize={40} collapsible={true} collapsedSize={0} id="settings-panel" order={0}>
              <SettingsPanel
                editingBlock={editingBlock}
                onUpdateBlockSettings={handleUpdateBlockSettings}
                onUpdateBlock={handleUpdateBlock}
                isOpen={true} // isOpen is now controlled by PanelGroup's rendering
                onCloseBlockSettings={() => setEditingBlock(null)}
                onDeleteBlock={handleDeleteBlock}
                // Pass global action handlers
                onSaveTemplate={handleSaveTemplate}
                onExportHtml={handleExportHtml}
                onExportImagesOnly={handleExportImagesOnly}
                onExportHtmlAndImages={handleExportHtmlAndImages}
                onDeleteAllBlocks={handleDeleteAllBlocks}
                campaignName={campaignName}
                onCampaignNameChange={setCampaignName}
                campaignSummary={campaignSummary}
                onCampaignSummaryChange={setCampaignSummary}
              />
            </Panel>
            <PanelResizeHandle className="w-2 bg-gray-200 hover:bg-gray-300 transition-colors" />
          </>
        )}
        {activePanel === 'urls' && (
          <>
            <PanelResizeHandle className="w-2 bg-gray-200 hover:bg-gray-300 transition-colors" />
            <Panel defaultSize={25} minSize={20} maxSize={40} collapsible={true} collapsedSize={0} id="urls-panel" order={0} className="h-full bg-card">
              <UrlDirectoryPanel blocks={blocks} />
            </Panel>
          </>
        )}
        <Panel defaultSize={activePanel ? 70 : 100} minSize={30} id="canvas-panel" order={1}>
          <div 
            className="flex flex-col h-full"
            style={{ 
              height: '100vh',
              overscrollBehavior: 'contain'
            }}
          >
            {/* Fixed Header Section */}
            <div className="flex-shrink-0 bg-background">
              {!isViewOnly && (
                <EditorToolbar
                addBlock={handleAddBlock}
                previewMode={previewMode}
                setPreviewMode={setPreviewMode}
                activePanel={activePanel}
                togglePanel={togglePanel}
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onUndo={handleUndo}
                onRedo={handleRedo}
                canUndo={historyPointer > 0}
                canRedo={historyPointer < history.length - 1}
                showReturnButton={!!roomIdFromUrl}
                onReturnToPlanner={handleReturnToPlanner}
                onExportHtml={handleExportHtml}
                onExportImagesOnly={handleExportImagesOnly}
                onExportHtmlAndImages={handleExportHtmlAndImages}
                onSendTestEmail={handleSendTestEmail}
                // onGenerateThumbnail={generateThumbnail} // Disabled - using real-time hover preview
                onOpenRoomInfo={() => setIsRoomInfoOpen(true)}
                showCollections={showCollections}
                onToggleCollections={() => setShowCollections(!showCollections)}
              />
              )}
              {!isViewOnly && (
                <CampaignHeaderFields
                  subjectLine={subjectLine}
                  onSubjectLineChange={setSubjectLine}
                  preheader={preheader}
                  onPreheaderChange={setPreheader}
                  sendDate={sendDate}
                  onSendDateChange={setSendDate}
                />
              )}
            </div>
            
            {/* Collection Preview Section */}
            {showCollections && (
              <div className="flex-shrink-0 bg-gray-50 border-b border-gray-200 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Collections</h3>
                  <button
                    onClick={() => setShowCollections(false)}
                    className="text-sm text-gray-500 hover:text-gray-700 transition"
                  >
                    Hide Collections
                  </button>
                </div>
                <CollectionPreview 
                  userId="public" 
                  onCollectionUpdate={() => {
                    // Refresh collections when they're updated
                  }}
                  onAddToEmail={handleAddToEmailWrapper}
                  showAddToEmailButton={true}
                />
              </div>
            )}

            {/* Scrollable Email Canvas Area */}
            <div 
              className={`flex-1 overflow-y-auto relative ${isAnyModalOpen ? 'pointer-events-none' : ''}`}
              style={{ 
                overscrollBehavior: 'contain',
                WebkitOverflowScrolling: 'touch'
              }}
              ref={(node) => {
                if (node) {
                  // Add wheel event listener for scroll control only - don't interfere with clicks
                  const handleWheel = (e: WheelEvent) => {
                    // Only handle wheel events if not interacting with form elements
                    const target = e.target as HTMLElement;
                    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
                      return;
                    }
                    
                    e.stopPropagation();
                    const element = e.currentTarget as HTMLElement;
                    const { scrollTop, scrollHeight, clientHeight } = element;
                    
                    // If at scroll boundaries, prevent default to stop page scroll
                    if ((e.deltaY < 0 && scrollTop === 0) || 
                        (e.deltaY > 0 && scrollTop + clientHeight >= scrollHeight)) {
                      e.preventDefault();
                    }
                  };
                  
                  // Add touch event listener for scroll only - don't interfere with touch interactions
                  const handleTouch = (e: TouchEvent) => {
                    // Only handle touch events if not interacting with form elements
                    const target = e.target as HTMLElement;
                    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
                      return;
                    }
                    
                    e.stopPropagation();
                  };
                  
                  node.addEventListener('wheel', handleWheel, { passive: false });
                  node.addEventListener('touchmove', handleTouch, { passive: false });
                  
                  // Cleanup function
                  return () => {
                    node.removeEventListener('wheel', handleWheel);
                    node.removeEventListener('touchmove', handleTouch);
                  };
                }
              }}
            >
              {/* Collaboration components moved to bottom-left and toolbar */}
              <div className="p-4">
                <style>{`
                  .slot-highlight { box-shadow: 0 0 0 3px rgba(181,177,157,0.75) inset; transition: box-shadow 0.2s ease; }
                `}</style>
                <EmailCanvas
                  blocks={blocks}
                  selectedBlock={selectedBlockState.block} // Pass the block part
                  currentSelectedElement={selectedBlockState.element} // Pass the element part
                  onSelectBlock={handleSelectBlock}
                  onShowSettings={handleShowSettings} // Pass the new settings handler
                  onBlocksChange={handleBlocksChange}
                  onDeleteBlock={handleDeleteBlock}
                onDuplicateBlock={handleDuplicateBlock}
                onUpdateBlockSettings={handleUpdateBlockSettings}
                previewMode={previewMode}
                zoom={zoom}
                isProductSearchSliderOpen={isProductSearchSliderOpen}
                onToggleProductSearchSlider={() => togglePanel('products')}
                onOpenImageEditor={handleOpenImageEditor} // Pass the image editor opener
                onOpenGifEditor={handleOpenGifEditor} // Pass the GIF editor opener
                isSettingsPanelOpen={activePanel === 'settings'} // Pass the state to highlight settings icon
                onGridItemSwap={handleGridItemSwap}
                // Comment props wired at page level
                comments={comments}
                onCreateComment={(blockId, text) => {
                  setComments(prev => [...prev, { id: uuidv4(), blockId, text }]);
                }}
                onResolveComment={(commentId) => {
                  setComments(prev => prev.map(c => c.id === commentId ? { ...c, resolved: true } : c));
                }}
                ownerId={ownerId || currentUser?.uid || ''}
              />
              </div>
            </div>
          </div>
        </Panel>
        {/* AI Panel removed - not needed for current project */}
      </PanelGroup>
      {currentUser && (
        <>
          <CollaborativeCursors 
            roomId={currentEmailId}
            currentUserId={currentUser.uid}
            currentUserName={currentUser.displayName || currentUser.email || 'Anonymous User'}
            enabled={collaborationEnabled}
          />
          <BlockSynchronizer
            roomId={currentEmailId}
            currentUserId={currentUser.uid}
            blocks={blocks}
            onBlocksChange={updateBlocksAndHistory}
            isRemoteChange={isRemoteChange}
          />
        </>
      )}
      <Toaster />
      {/* New collaboration UI components */}
      {currentUser && (
        <>
          {/* Bottom-left collaborators display */}
          <CollaboratorsDisplay
            roomId={currentEmailId}
            activeUsers={activeUsers}
            currentUser={currentUser}
            onInviteUser={(email) => {
              // TODO: Implement email invitation
              console.log('Invite user:', email);
            }}
            collaborationEnabled={collaborationEnabled}
            onToggleCollaboration={() => setCollaborationEnabled(!collaborationEnabled)}
            isRoomOwner={ownerId === currentUser?.uid}
          />
          
          {/* Compact meeting chat */}
          <CompactMeetingChat
            roomId={currentEmailId}
            currentUser={currentUser}
            isOpen={isChatOpen}
            onToggle={() => setIsChatOpen(!isChatOpen)}
            onNewMessage={() => {
              // Auto-open chat when new message arrives
              if (!isChatOpen) {
                setIsChatOpen(true);
              }
            }}
          />
          
          {/* Room info modal */}
          <RoomInfoModal
            isOpen={isRoomInfoOpen}
            onClose={() => setIsRoomInfoOpen(false)}
            roomId={currentEmailId}
            currentUser={currentUser}
            campaignName={campaignName}
            subjectLine={subjectLine}
            sendDate={sendDate}
            activeUsers={activeUsers}
          />
        </>
      )}
      {isMeetingOpen && (
        <MeetingOverlay
          roomName={`email-room-${currentEmailId}`}
          displayName={currentUser?.displayName || currentUser?.email || 'Guest'}
          onClose={() => setIsMeetingOpen(false)}
        />
      )}
      {isCursorSettingsOpen && (
        <CursorSettings
          isOpen={isCursorSettingsOpen}
          onClose={() => setIsCursorSettingsOpen(false)}
        />
      )}
      {/* Render PolotnoStudioModal */}
      {isImageEditorOpen && imageToEdit && (
        <ErrorBoundary 
          fallback={<div className="p-4 text-red-500">Failed to load image editor. Please refresh the page.</div>}
          onRetry={() => {
            // Force a re-render by toggling the modal
            handleCloseImageEditor();
            setTimeout(() => {
              // Reopen the modal after a brief delay
              if (imageToEdit) {
                // This will trigger the dynamic import again
              }
            }, 100);
          }}
        >
          <PolotnoStudioModal
            isOpen={isImageEditorOpen}
            onClose={handleCloseImageEditor}
            onSave={handleSaveImageEditor}
            initialImageUrl={imageToEdit.imageUrl}
            title="Edit Image"
          />
        </ErrorBoundary>
      )}
      {isGifEditorOpen && gifSourceData && (
        <GifEditorModal
          isOpen={isGifEditorOpen}
          onClose={handleCloseGifEditor}
          gifSourceData={gifSourceData}
          onSave={handleSaveGifEditor}
        />
      )}
      
      {/* Information Toggle Button - Bottom Right (next to chat) */}
      <div className="fixed bottom-5 right-16 z-[10000]">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsRoomInfoOpen(true)}
          title="Room Information"
          aria-label="Room Information"
          className="bg-white/90 backdrop-blur border-gray-300 shadow-lg hover:bg-white"
        >
          <Info className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Send Email Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Send Test Email</DialogTitle>
            <DialogDescription>
              Enter email addresses separated by commas to send the test email to multiple recipients.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="recipients" className="text-right">
                Recipients
              </Label>
              <Input
                id="recipients"
                value={emailRecipients}
                onChange={(e) => setEmailRecipients(e.target.value)}
                placeholder={currentUser?.email || currentUser?.displayName || "your-email@example.com"}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEmailDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmSendEmail}>
              Send Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DndProvider>
  );
}

export default function EmailEditorComponent() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading email editor...</div>}>
      <EmailEditorContent />
    </Suspense>
  );
}
