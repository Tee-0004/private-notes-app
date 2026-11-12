
import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getNotes,
  createNote,
  updateNote,
  updateNoteStatus,
  deleteNote,
} from '../services/notesService';
import RichTextEditor from '../components/RichTextEditor';
import DOMPurify from 'dompurify';

function hasNoteText(value) {
  return String(value || '')
    .replace(/<\/?(p|div|br|strong|em|u|mark|ul|ol|li|input|label|h[1-6])\b[^>]*>/gi, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&#160;/gi, ' ')
    .trim()
    .length > 0;
}

function getGreeting() {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return 'Good morning';
  }

  if (hour >= 12 && hour < 17) {
    return 'Good afternoon';
  }

  if (hour >= 17 && hour < 21) {
    return 'Good evening';
  }

  return 'Good night';
}

function Dashboard() {
  const { user, logout } = useAuth();

  // Dashboard state
  const [notes, setNotes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  const [updatingNoteId, setUpdatingNoteId] = useState(null);
  const [statusError, setStatusError] = useState('');

  // Search, sorting and note preview state
  const searchInputRef = useRef(null);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [sortBy, setSortBy] = useState('all');

  // Note creation state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [createError, setCreateError] = useState('');

  // Note editing state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deletingNoteId, setDeletingNoteId] = useState(null);

  const firstName =
    user?.user_metadata?.full_name?.trim().split(/\s+/)[0] ||
    'there';

  const today = new Date().toLocaleDateString('en-ZA', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Retrieve notes when the dashboard loads
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setLoading(true);
        setError('');

        const data = await getNotes();
        setNotes(data);
      } catch (error) {
        setError(error.message || 'Unable to load your notes.');
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, []);

  // Select notes for the current workspace, then apply search and sorting.
  const filteredNotes = useMemo(() => {
    let visibleNotes = notes;
    const search = searchTerm.trim().toLowerCase();

    if (activeView === 'dashboard' || activeView === 'notes') {
      // Archived notes stay hidden normally, but become searchable here.
      visibleNotes = search
        ? notes
        : notes.filter((note) => !note.is_archived);
    } else if (activeView === 'favorites') {
      visibleNotes = notes.filter(
        (note) => note.is_favorite && !note.is_archived
      );
    } else if (activeView === 'archived') {
      visibleNotes = notes.filter((note) => note.is_archived);
    }

    if (search) {
      visibleNotes = visibleNotes.filter((note) => {
        const title = (note.title || '').toLowerCase();
        const content = (note.content || '')
          .replace(/<[^>]*>/g, ' ')
          .replace(/&nbsp;/gi, ' ')
          .replace(/&#160;/gi, ' ')
          .toLowerCase();

        return `${title} ${content}`.includes(search);
      });
    }

    const sortedNotes = [...visibleNotes];

    if (sortBy === 'newest') {
      sortedNotes.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
    } else if (sortBy === 'recently-updated') {
      sortedNotes.sort(
        (a, b) => new Date(b.updated_at || b.created_at) -
                  new Date(a.updated_at || a.created_at)
      );
    } else if (sortBy === 'oldest') {
      sortedNotes.sort(
        (a, b) => new Date(a.created_at) - new Date(b.created_at)
      );
    } else if (sortBy === 'az') {
      sortedNotes.sort((a, b) =>
        (a.title || '').localeCompare(b.title || '')
      );
    }

    return sortedNotes;
  }, [notes, searchTerm, activeView, sortBy]);

  // Show title matches before matches found only in note content.
  const searchSuggestions = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    if (!search) return [];

    return [...filteredNotes]
      .sort((a, b) => {
        const aStartsWith = (a.title || '').toLowerCase().startsWith(search);
        const bStartsWith = (b.title || '').toLowerCase().startsWith(search);
        return Number(bStartsWith) - Number(aStartsWith);
      })
      .slice(0, 6);
  }, [filteredNotes, searchTerm]);

  // Count notes created in the last seven days
  const recentlyCreated = notes.filter((note) => {
    const createdDate = new Date(note.created_at);
    const sevenDaysAgo = new Date();

    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return createdDate >= sevenDaysAgo;
  }).length;

  // Find the most recently updated note
  const latestNote = [...notes].sort((a, b) => {
    const dateA = new Date(a.updated_at || a.created_at);
    const dateB = new Date(b.updated_at || b.created_at);

    return dateB - dateA;
  })[0];

  const lastUpdated = latestNote
    ? new Date(latestNote.updated_at || latestNote.created_at)
        .toLocaleDateString('en-ZA', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
    : '—';

  // Log out
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Open note creation window
  const openCreateModal = () => {
    setCreateError('');
    setNoteTitle('');
    setNoteContent('');
    setShowCreateModal(true);
  };

  // Create and save a new note
  const handleCreateNote = async (e) => {
    e.preventDefault();

    if (!noteTitle.trim() || !hasNoteText(noteContent)) {
      setCreateError('Please enter both a title and note content.');
      return;
    }

    try {
      setSavingNote(true);
      setCreateError('');

      const data = await createNote(
        noteTitle.trim(),
        noteContent.trim()
      );

      setNotes((previousNotes) => [
        data.note,
        ...previousNotes,
      ]);

      setNoteTitle('');
      setNoteContent('');
      setShowCreateModal(false);

    } catch (error) {
      setCreateError(error.message || 'Unable to save your note.');
    } finally {
      setSavingNote(false);
    }
  };

  // Open the edit window and load the selected note
  const openEditModal = (note) => {
    setEditingNote(note);
    setEditTitle(note.title || '');
    setEditContent(note.content || '');
    setEditError('');
    setShowEditModal(true);
  };

  // Save changes to an existing note
  const handleUpdateNote = async (e) => {
    e.preventDefault();

    if (!editTitle.trim() || !hasNoteText(editContent)) {
      setEditError('Please enter both a title and note content.');
      return;
    }

    try {
      setSavingEdit(true);
      setEditError('');

      const data = await updateNote(
        editingNote.id,
        editTitle.trim(),
        editContent.trim()
      );

      const updatedNote = data.note || data;

      setNotes((previousNotes) =>
        previousNotes.map((note) =>
          note.id === editingNote.id ? updatedNote : note
        )
      );

      setShowEditModal(false);
      setEditingNote(null);
      setEditTitle('');
      setEditContent('');
    } catch (error) {
      setEditError(error.message || 'Unable to update your note.');
    } finally {
      setSavingEdit(false);
    }
  };

  // Save favourite/archive changes to the backend and update the screen.
  const handleNoteStatus = async (note, updates) => {
    try {
      setUpdatingNoteId(note.id);
      setStatusError('');

      const data = await updateNoteStatus(note.id, updates);
      const updatedNote = data.note || data;

      setNotes((previousNotes) =>
        previousNotes.map((item) =>
          item.id === note.id ? updatedNote : item
        )
      );
    } catch (error) {
      setStatusError(
        error.message || 'Unable to update this note. Please try again.'
      );
    } finally {
      setUpdatingNoteId(null);
    }
  };

  // Delete a note after confirmation
  const handleDeleteNote = async (note) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${note.title}"?`
    );

    if (!confirmed) return;

    try {
      setDeletingNoteId(note.id);
      setDeleteError('');

      await deleteNote(note.id);

      setNotes((previousNotes) =>
        previousNotes.filter((item) => item.id !== note.id)
      );
    } catch (error) {
      setDeleteError(error.message || 'Unable to delete your note.');
    } finally {
      setDeletingNoteId(null);
    }
  };


  // Navigation links
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '▦' },
    { id: 'notes', label: 'My Notes', icon: '▤' },
    { id: 'favorites', label: 'Favourites', icon: '☆' },
    { id: 'archived', label: 'Archived', icon: '▣' },
  ];

  const navigationLinks = navigationItems.map((item) => (
    <button
      key={item.id}
      type="button"
      onClick={() => {
        setActiveView(item.id);
        setSearchTerm('');
        setMenuOpen(false);
      }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-medium transition-colors duration-200 ${
        activeView === item.id
          ? 'bg-[#DCE9D9] text-[#292A25]'
          : 'text-[#77786F] hover:bg-[#F4F6F0] hover:text-[#292A25]'
      }`}
    >
      <span className="w-5 text-center" aria-hidden="true">{item.icon}</span>
      {item.label}
      {item.id === 'favorites' && (
        <span className="ml-auto text-xs text-[#77786F]">
          {notes.filter((note) => note.is_favorite && !note.is_archived).length}
        </span>
      )}
      {item.id === 'archived' && (
        <span className="ml-auto text-xs text-[#77786F]">
          {notes.filter((note) => note.is_archived).length}
        </span>
      )}
    </button>
  ));

  // User profile
  const userProfile = (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 shrink-0 rounded-full bg-[#DCE9D9] flex items-center justify-center text-[#292A25] font-semibold">
        {firstName.charAt(0).toUpperCase()}
      </div>

      <div className="min-w-0">
        <p className="text-sm font-semibold text-[#292A25] truncate">
          {firstName}
        </p>
        <p className="text-xs text-[#77786F] truncate">
          {user?.email}
        </p>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#F0F2EA] flex">

      {/* DESKTOP AND TABLET SIDEBAR */}
      <aside className="hidden md:flex w-64 shrink-0 min-h-screen bg-white border-r border-[#E5E8DF] flex-col px-6 py-8">

        {/* Branding */}
        <div className="flex items-center gap-3 mb-12">
          <div className="w-11 h-11 rounded-xl bg-[#DCE9D9] flex items-center justify-center">
            <span className="text-[#292A25] text-xl">✎</span>
          </div>

          <div>
            <h1 className="font-semibold text-[#292A25]">
              Private Notes
            </h1>
            <p className="text-xs text-[#77786F]">
              Your personal space
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#77786F] mb-4">
            Workspace
          </p>

          {navigationLinks}
        </nav>

        {/* User Profile */}
        <div className="border-t border-[#E5E8DF] pt-5">
          <div className="mb-5">
            {userProfile}
          </div>

          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2.5 rounded-xl text-sm text-[#77786F] hover:bg-red-50 hover:text-red-600 transition"
          >
            ↪ Log out
          </button>
        </div>

      </aside>

      {/* MAIN LAYOUT */}
      <div className="flex-1 min-w-0">

        {/* MOBILE TOP NAVIGATION */}
        <header className="md:hidden sticky top-0 z-30 bg-white border-b border-[#E5E8DF] px-4 py-4">

          <div className="flex items-center justify-between">

            {/* Branding */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#DCE9D9] flex items-center justify-center">
                <span className="text-[#292A25] text-xl">✎</span>
              </div>

              <div>
                <h1 className="font-semibold text-[#292A25]">
                  Private Notes
                </h1>
                <p className="text-xs text-[#77786F]">
                  Your personal space
                </p>
              </div>
            </div>

            {/* Hamburger Button */}
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={menuOpen}
              className="w-11 h-11 flex items-center justify-center rounded-xl border border-[#E5E8DF] text-[#292A25] hover:bg-[#F0F2EA] transition"
            >
              {menuOpen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="23"
                  height="23"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="23"
                  height="23"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M4 6h16" />
                  <path d="M4 12h16" />
                  <path d="M4 18h16" />
                </svg>
              )}
            </button>

          </div>

        </header>

        {/* MOBILE MENU BACKDROP */}
        {menuOpen && (
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={() => setMenuOpen(false)}
            className="md:hidden fixed inset-0 z-40 bg-deep-navy/30"
          />
        )}

        {/* MOBILE SLIDE-OUT DRAWER */}
        <aside
          className={`md:hidden fixed top-0 right-0 z-50 h-full w-72 max-w-[85vw] bg-white shadow-xl border-l border-[#E5E8DF] flex flex-col p-6 transition-transform duration-300 ${
            menuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          aria-hidden={!menuOpen}
        >

          <div className="flex items-center justify-between mb-10">
            <h2 className="font-semibold text-lg text-[#292A25]">
              Navigation
            </h2>

            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Close navigation menu"
              className="w-9 h-9 rounded-lg hover:bg-[#F0F2EA] text-[#292A25]"
            >
              ✕
            </button>
          </div>

          <nav className="flex-1 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#77786F] mb-4">
              Workspace
            </p>

            {navigationLinks}
          </nav>

          <div className="border-t border-[#E5E8DF] pt-5">
            <div className="mb-5">
              {userProfile}
            </div>

            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2.5 rounded-xl text-sm text-[#77786F] hover:bg-red-50 hover:text-red-600 transition"
            >
              ↪ Log out
            </button>
          </div>

        </aside>

        {/* MAIN DASHBOARD CONTENT */}
        <section id="dashboard" className="px-4 py-6 sm:px-6 sm:py-8 lg:px-12 lg:py-9">

          <div className="max-w-7xl mx-auto">

            {/* Welcome Section */}
            {activeView === 'dashboard' && <header className="mb-8 sm:mb-9">
              <p className="text-sm text-[#77786F] mb-2">
                {today}
              </p>

              <h2 className="text-2xl sm:text-3xl font-semibold text-[#292A25] tracking-tight">
                {getGreeting()}, {firstName}!
              </h2>

              <p className="text-sm sm:text-base text-[#77786F] mt-2">
                Keep your thoughts organised, one note at a time.
              </p>
            </header>}

            {/* Search and Create Note */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 sm:mb-9">

              <div className="flex-1 relative min-w-0">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      searchInputRef.current?.focus();
                      setShowSearchResults(true);
                    }}
                    aria-label="Focus search"
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-lg text-[#77786F] hover:bg-[#F0F2EA] hover:text-[#527A5A] transition"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="23"
                      height="23"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <circle cx="11" cy="11" r="7" />
                      <path d="m20 20-4-4" />
                    </svg>
                  </button>

                  <input
                    ref={searchInputRef}
                    type="search"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setShowSearchResults(true);
                    }}
                    onFocus={() => setShowSearchResults(true)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') setShowSearchResults(false);
                    }}
                    placeholder={`Search ${activeView === 'favorites' ? 'favourites' : activeView === 'archived' ? 'archived notes' : 'your notes'}...`}
                    className="w-full pl-14 pr-4 py-3.5 bg-white border border-[#E5E8DF] rounded-xl outline-none focus:border-[#A9C6A5] focus:ring-4 focus:ring-[#A9C6A5]/20 transition"
                  />
                </div>

                {showSearchResults && searchTerm.trim() && (
                  <div className="absolute top-full left-0 right-0 mt-2 z-30 bg-white border border-[#E5E8DF] rounded-2xl shadow-xl overflow-hidden">
                    {searchSuggestions.length > 0 ? (
                      <div className="py-2">
                        <p className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#77786F]">
                          Search results
                        </p>

                        {searchSuggestions.map((note) => (
                          <button
                            key={note.id}
                            type="button"
                            onClick={() => {
                              setShowSearchResults(false);

                              // Bring the matching note card into view.
                              window.setTimeout(() => {
                                document
                                  .getElementById(`note-card-${note.id}`)
                                  ?.scrollIntoView({
                                    behavior: 'smooth',
                                    block: 'center',
                                  });
                              }, 50);
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-[#F0F2EA] transition flex items-center gap-3"
                          >
                            <span className="w-9 h-9 shrink-0 rounded-xl bg-[#DCE9D9] flex items-center justify-center text-[#527A5A]">
                              ✎
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block text-sm font-medium text-[#292A25] truncate">
                                {note.title}
                              </span>
                              <span className="block text-xs text-[#77786F] mt-1">
                                {new Date(note.created_at).toLocaleDateString('en-ZA')}
                              </span>
                            </span>
                            <span className="text-[#77786F]">→</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="px-5 py-7 text-center">
                        <p className="font-medium text-[#292A25]">No notes found</p>
                        <p className="text-sm text-[#77786F] mt-1">
                          Try another title or keyword.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={openCreateModal}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#527A5A] text-white font-medium hover:bg-[#42684A] transition shadow-sm"
              >
                + Create note
              </button>

            </div>

            {/* Notes Sorting */}
            <div className="flex justify-end mb-5">
              <div className="flex items-center gap-3">
                <label htmlFor="notesSort" className="text-sm text-[#77786F]">
                  Sort by
                </label>
                <select
                  id="notesSort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2.5 rounded-xl bg-white border border-[#E5E8DF] text-sm text-[#292A25] outline-none focus:border-[#A9C6A5] focus:ring-4 focus:ring-[#A9C6A5]/20 transition"
                >
                  <option value="all">All notes</option>
                  <option value="newest">Newest first</option>
                  <option value="recently-updated">Recently updated</option>
                  <option value="oldest">Oldest first</option>
                  <option value="az">A–Z</option>
                </select>
              </div>
            </div>

            {/* Notes Overview */}
            {activeView === 'dashboard' && <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 mb-9 sm:mb-10">

              <div className="bg-[#F7F8F4] border border-[#E5E8DF] rounded-2xl p-5 sm:p-6 shadow-[0_4px_18px_rgba(41,42,37,0.05)] hover:shadow-[0_8px_24px_rgba(41,42,37,0.08)] transition-shadow">
                <p className="text-sm text-[#77786F]">Total notes</p>
                <h3 className="text-3xl font-semibold text-[#292A25] mt-3">
                  {loading ? '...' : notes.length}
                </h3>
              </div>

              <div className="bg-[#F7F8F4] border border-[#E5E8DF] rounded-2xl p-5 sm:p-6 shadow-[0_4px_18px_rgba(41,42,37,0.05)] hover:shadow-[0_8px_24px_rgba(41,42,37,0.08)] transition-shadow">
                <p className="text-sm text-[#77786F]">
                  Created in the last 7 days
                </p>
                <h3 className="text-3xl font-semibold text-[#292A25] mt-3">
                  {loading ? '...' : recentlyCreated}
                </h3>
              </div>

              <div className="bg-[#F7F8F4] border border-[#E5E8DF] rounded-2xl p-5 sm:p-6 shadow-[0_4px_18px_rgba(41,42,37,0.05)] hover:shadow-[0_8px_24px_rgba(41,42,37,0.08)] transition-shadow">
                <p className="text-sm text-[#77786F]">Last updated</p>
                <h3 className="text-lg font-semibold text-[#292A25] mt-4">
                  {loading ? '...' : lastUpdated}
                </h3>
              </div>

            </div>}



            {/* Notes Section */}
            <section id="notes">

              <div className="mb-5">
                <h3 className="text-xl font-semibold text-[#292A25]">
                  {activeView === 'favorites' ? 'Favourites' : activeView === 'archived' ? 'Archived Notes' : 'My Notes'}
                </h3>

                <p className="text-sm text-[#77786F] mt-1">
                  {activeView === 'favorites'
                    ? 'The notes you have marked as important.'
                    : activeView === 'archived'
                      ? 'Notes you have moved out of your active collection.'
                      : 'Your personal collection of thoughts and ideas.'}
                </p>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="bg-white border border-[#E5E8DF] rounded-2xl px-6 py-16 text-center">
                  <p className="text-[#77786F]">
                    Loading your notes...
                  </p>
                </div>
              )}

              {/* Error State */}
              {!loading && error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl px-6 py-8 text-center">
                  <p className="text-red-700 font-medium">
                    We couldn't load your notes.
                  </p>

                  <p className="text-sm text-red-600 mt-2">
                    {error}
                  </p>
                </div>
              )}

              {/* Empty State */}
              {!loading && !error && notes.length === 0 && (
                <div className="bg-white border border-[#E5E8DF] rounded-2xl px-5 sm:px-6 py-12 sm:py-16 text-center">

                  <div className="w-16 h-16 rounded-2xl bg-[#DCE9D9] mx-auto flex items-center justify-center mb-5">
                    <span className="text-3xl text-[#292A25]">✎</span>
                  </div>

                  <h4 className="text-lg font-semibold text-[#292A25]">
                    Your notes will appear here
                  </h4>

                  <p className="text-sm text-[#77786F] max-w-md mx-auto mt-2 leading-relaxed">
                    This is your private space to capture ideas, thoughts,
                    reminders and everything you want to remember.
                  </p>

                </div>
              )}

              {!loading && !error && notes.length > 0 && filteredNotes.length === 0 && !searchTerm.trim() && (
                <div className="bg-white border border-[#E5E8DF] rounded-2xl px-6 py-12 text-center">
                  <h4 className="text-lg font-semibold text-[#292A25]">
                    {activeView === 'favorites' ? 'No favourite notes yet' : activeView === 'archived' ? 'No archived notes' : 'No notes in this view'}
                  </h4>
                  <p className="text-sm text-[#77786F] mt-2">
                    {activeView === 'favorites'
                      ? 'Use the star on a note to add it to your favourites.'
                      : activeView === 'archived'
                        ? 'When you archive a note, it will appear here.'
                        : 'Create a note to get started.'}
                  </p>
                </div>
              )}

              {/* No Search Results */}
              {!loading && !error && notes.length > 0 && filteredNotes.length === 0 && searchTerm.trim() && (
                <div className="bg-white border border-[#E5E8DF] rounded-2xl px-6 py-12 text-center">
                  <h4 className="text-lg font-semibold text-[#292A25]">
                    No matching notes found
                  </h4>

                  <p className="text-sm text-[#77786F] mt-2">
                    Try searching with a different title or keyword.
                  </p>
                </div>
              )}

              {/* Delete Error */}
              {!loading && deleteError && (
                <div
                  role="alert"
                  className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700"
                >
                  {deleteError}
                </div>
              )}

              {statusError && (
                <div role="alert" className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                  {statusError}
                </div>
              )}

              {/* Notes List */}
              {!loading && !error && filteredNotes.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">

                  {filteredNotes.map((note) => (
                    <article
                      key={note.id}
                      id={`note-card-${note.id}`}
                      className="min-w-0 bg-[#FFFFFF] border border-[#E5E8DF] rounded-2xl p-5 sm:p-6 shadow-[0_4px_18px_rgba(41,42,37,0.05)] hover:shadow-[0_10px_28px_rgba(41,42,37,0.09)] hover:-translate-y-0.5 transition-all duration-200"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <h4 className="text-lg font-semibold text-[#292A25] break-words">
                          {note.title}
                        </h4>

                        <button
                          type="button"
                          onClick={() => handleNoteStatus(note, { is_favorite: !note.is_favorite })}
                          disabled={updatingNoteId === note.id}
                          aria-label={note.is_favorite ? 'Remove from favourites' : 'Add to favourites'}
                          aria-pressed={Boolean(note.is_favorite)}
                          title={note.is_favorite ? 'Remove from favourites' : 'Add to favourites'}
                          className={`shrink-0 w-9 h-9 rounded-full border transition-all duration-200 hover:scale-105 disabled:opacity-50 ${note.is_favorite ? 'bg-[#FFF5D9] border-[#E9D69B] text-[#A87919]' : 'bg-white border-[#E5E8DF] text-[#8A8B82] hover:bg-[#FFF9E9] hover:text-[#A87919]'}`}
                        >
                          {note.is_favorite ? '★' : '☆'}
                        </button>
                      </div>

                      {/* Safely display formatted note content */}
                      <div
                        className="text-sm text-[#77786F] mt-3 break-words line-clamp-5 [&_p]:my-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-1 [&_mark]:rounded [&_mark]:px-0.5"
                        dangerouslySetInnerHTML={{
                          __html: DOMPurify.sanitize(note.content || '')
                        }}
                      />

                      <p className="text-xs text-[#77786F] mt-6 pt-4 border-t border-[#E5E8DF]">
                        Created: {new Date(note.created_at).toLocaleDateString('en-ZA')}
                      </p>

                      {/* Note Actions */}
                      <div className="flex flex-wrap items-center gap-2 mt-4">

                        <button
                          type="button"
                          onClick={() => openEditModal(note)}
                          className="px-3 py-2 rounded-lg text-xs font-medium bg-[#F0F2EA] text-[#42684A] hover:bg-[#DCE9D9] transition"
                        >
                          Edit
                        </button>

                        {note.is_archived ? (
                          <button
                            type="button"
                            onClick={() => handleNoteStatus(note, { is_archived: false })}
                            disabled={updatingNoteId === note.id}
                            className="px-3 py-2 rounded-lg text-xs font-medium bg-[#DCE9D9] text-[#42684A] hover:bg-[#C9DDC5] transition disabled:opacity-50"
                          >
                            {updatingNoteId === note.id ? 'Updating...' : 'Restore'}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleNoteStatus(note, { is_archived: true })}
                            disabled={updatingNoteId === note.id}
                            className="px-3 py-2 rounded-lg text-xs font-medium bg-[#F0F2EA] text-[#77786F] hover:bg-[#E5E8DF] transition disabled:opacity-50"
                          >
                            {updatingNoteId === note.id ? 'Updating...' : 'Archive'}
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDeleteNote(note)}
                          disabled={deletingNoteId === note.id}
                          className="px-3 py-2 rounded-lg text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition disabled:opacity-50"
                        >
                          {deletingNoteId === note.id ? 'Deleting...' : 'Delete'}
                        </button>

                      </div>

                    </article>
                  ))}

                </div>
              )}

            </section>
          </div>
        </section>
      </div>

      {/* EDIT NOTE MODAL */}
      {showEditModal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-[#292A25]/40 px-4 py-6 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget && !savingEdit) {
              setShowEditModal(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-note-heading"
            className="w-full max-w-2xl bg-white rounded-3xl shadow-xl p-6 sm:p-8 my-auto"
          >
            {/* Modal Heading */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2
                  id="edit-note-heading"
                  className="text-2xl font-semibold text-[#292A25]"
                >
                  Edit note
                </h2>

                <p className="text-sm text-[#77786F] mt-2">
                  Make changes to your note.
                </p>
              </div>

              <button
                type="button"
                disabled={savingEdit}
                onClick={() => setShowEditModal(false)}
                aria-label="Close note editor"
                className="w-9 h-9 shrink-0 rounded-lg text-[#77786F] hover:bg-[#F0F2EA] hover:text-[#292A25] transition disabled:opacity-50"
              >
                ✕
              </button>
            </div>

            {/* Edit Note Form */}
            <form onSubmit={handleUpdateNote} className="space-y-5">

              <div>
                <label
                  htmlFor="editNoteTitle"
                  className="block text-sm font-medium text-[#292A25] mb-2"
                >
                  Note title
                </label>

                <input
                  id="editNoteTitle"
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  maxLength={120}
                  required
                  autoFocus
                  className="w-full px-4 py-3.5 rounded-xl border border-[#E5E8DF] bg-white text-[#292A25] outline-none transition focus:border-[#A9C6A5] focus:ring-4 focus:ring-[#A9C6A5]/20"
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-[#292A25] mb-2"
                >
                  Note content
                </label>

                <RichTextEditor
                  content={editContent}
                  onChange={setEditContent}
                  placeholder="Make changes to your thoughts..."
                />
              </div>

              {editError && (
                <div
                  role="alert"
                  className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700"
                >
                  {editError}
                </div>
              )}

              {/* Edit Modal Buttons */}
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">

                <button
                  type="button"
                  disabled={savingEdit}
                  onClick={() => setShowEditModal(false)}
                  className="px-5 py-3 rounded-xl border border-[#E5E8DF] text-[#292A25] font-medium hover:bg-[#F0F2EA] transition disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-6 py-3 rounded-xl bg-[#527A5A] text-white font-medium hover:bg-[#42684A] transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {savingEdit ? 'Saving changes...' : 'Save changes'}
                </button>

              </div>
            </form>

          </div>
        </div>
      )}

      {/* CREATE NOTE MODAL */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-[#292A25]/40 px-4 py-6 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget && !savingNote) {
              setShowCreateModal(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-note-heading"
            className="w-full max-w-2xl bg-white rounded-3xl shadow-xl p-6 sm:p-8 my-auto"
          >

            {/* Modal Heading */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2
                  id="create-note-heading"
                  className="text-2xl font-semibold text-[#292A25]"
                >
                  Create a new note
                </h2>

                <p className="text-sm text-[#77786F] mt-2">
                  Capture a thought, idea or reminder.
                </p>
              </div>

              <button
                type="button"
                disabled={savingNote}
                onClick={() => setShowCreateModal(false)}
                aria-label="Close note editor"
                className="w-9 h-9 shrink-0 rounded-lg text-[#77786F] hover:bg-[#F0F2EA] hover:text-[#292A25] transition disabled:opacity-50"
              >
                ✕
              </button>
            </div>

            {/* Create Note Form */}
            <form onSubmit={handleCreateNote} className="space-y-5">

              <div>
                <label
                  htmlFor="noteTitle"
                  className="block text-sm font-medium text-[#292A25] mb-2"
                >
                  Note title
                </label>

                <input
                  id="noteTitle"
                  type="text"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="Give your note a title..."
                  maxLength={120}
                  required
                  autoFocus
                  className="w-full px-4 py-3.5 rounded-xl border border-[#E5E8DF] bg-white text-[#292A25] placeholder:text-[#77786F]/70 outline-none transition focus:border-[#A9C6A5] focus:ring-4 focus:ring-[#A9C6A5]/20"
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-[#292A25] mb-2"
                >
                  Note content
                </label>

                <RichTextEditor
                  content={noteContent}
                  onChange={setNoteContent}
                  placeholder="Start writing your thoughts..."
                />
              </div>

              {createError && (
                <div
                  role="alert"
                  className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700"
                >
                  {createError}
                </div>
              )}

              {/* Create Modal Buttons */}
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">

                <button
                  type="button"
                  disabled={savingNote}
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-3 rounded-xl border border-[#E5E8DF] text-[#292A25] font-medium hover:bg-[#F0F2EA] transition disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={savingNote}
                  className="px-6 py-3 rounded-xl bg-[#527A5A] text-white font-medium hover:bg-[#42684A] transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {savingNote ? 'Saving note...' : 'Save note'}
                </button>

              </div>

            </form>

          </div>
        </div>
      )}

    </main>
  );
}

export default Dashboard;