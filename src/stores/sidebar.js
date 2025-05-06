import { defineStore } from 'pinia';
import { useApolloClient } from '@vue/apollo-composable';
import { FIND_USER_BY_USERNAME } from '@/graphql/auth.js'; // Query to fetch basic user details by username

/**
 * @module store/sidebar
 * @description Pinia store for managing the state of the application's sidebar.
 * This includes tracking expanded sections, recently visited user profiles/libraries,
 * recently visited flashcard sets, and recent search queries.
 * It utilizes pinia-plugin-persistedstate to save specified state properties to sessionStorage,
 * allowing sidebar state like recent items and expanded sections to persist across page reloads.
 */
export const useSidebarStore = defineStore('sidebar', {
    state: () => ({
        // Tracks the keys (e.g., 'recent-profiles') of expanded sidebar sections. Uses a Set for efficient operations.
        expandedItems: new Set(),

        // Stores recently visited user profiles. Fetches details asynchronously. Limited size via maxSize.
        visitedUserProfiles: [], // Array of { username, id, firstName, lastName, isLoading, hasPictureError, type: 'profile', isDynamic: true }

        // Stores recently visited user libraries. Similar structure and logic to visitedUserProfiles.
        visitedUserLibraries: [], // Array of { username, id, firstName, lastName, isLoading, hasPictureError, type: 'library', isDynamic: true }

        // Stores recently visited flashcard sets. Limited size via maxSize.
        visitedFlashcardSets: [], // Array of { id, title, type: 'set', isDynamic: true }

        // Keeps track of recent search queries. Limited size via maxSize.
        recentSearchQueries: [], // Array of { query, name, path, type: 'search', isDynamic: true }

        // Holds the Apollo Client instance once initialized by initializeApolloClient action.
        _client: null,
    }),

    getters: {
        /**
         * Checks if a specific sidebar section is currently expanded.
         * Returns a function that takes the item key.
         * @param {object} state - The store's state provided by Pinia.
         * @returns {function(string): boolean} A function that accepts an itemKey and returns true if expanded, false otherwise.
         */
        isItemExpanded: (state) => (itemKey) => {
            return state.expandedItems.has(itemKey);
        },
    },

    actions: {
        /**
         * Initializes the Apollo Client instance within the store if not already done.
         * Essential to call this before using actions that perform GraphQL queries.
         * @returns {void}
         */
        initializeApolloClient() {
            // Prevent re-initialization if the client is already set
            if (!this._client) {
                // Obtain the Apollo Client instance provided higher up in the component tree
                const { client } = useApolloClient();
                this._client = client;
            }
        },

        /**
         * Marks a sidebar section (by its key) as expanded.
         * @param {string} itemKey - The unique key identifying the sidebar section.
         * @returns {void}
         */
        expandItem(itemKey) {
            if (itemKey) {
                this.expandedItems.add(itemKey); // Add key to the Set of expanded items
            }
        },

        /**
         * Marks a sidebar section (by its key) as collapsed.
         * @param {string} itemKey - The unique key identifying the sidebar section.
         * @returns {void}
         */
        collapseItem(itemKey) {
            if (itemKey) {
                this.expandedItems.delete(itemKey); // Remove key from the Set of expanded items
            }
        },

        /**
         * Toggles the expansion state of a sidebar section.
         * @param {string} itemKey - The unique key identifying the sidebar section.
         * @returns {void}
         */
        toggleItemExpansion(itemKey) {
            // Check current state and call appropriate action
            if (this.expandedItems.has(itemKey)) {
                this.collapseItem(itemKey);
            } else {
                this.expandItem(itemKey);
            }
        },

        /**
         * Adds or updates a user entry (profile or library) in the 'recently visited' list.
         * Fetches user details (ID, name) via Apollo if the entry is new.
         * Moves existing entries to the front upon revisit.
         * @param {string} username - The username of the visited profile/library owner.
         * @param {'profile' | 'library'} type - The type of entry ('profile' or 'library').
         * @returns {Promise<void>}
         */
        async addVisitedEntry(username, type) {
            // Basic validation for required parameters
            if (!username || !type || (type !== 'profile' && type !== 'library')) {
                console.warn('[SidebarStore] Invalid arguments for addVisitedEntry:', { username, type });
                return;
            }
            // Ensure Apollo Client is ready for potential fetch
            this.initializeApolloClient();

            // Select the correct list based on type
            const list = type === 'profile' ? this.visitedUserProfiles : this.visitedUserLibraries;
            // Check if the entry already exists
            const existingIndex = list.findIndex(entry => entry.username === username);

            // If entry exists, handle moving it to the front
            if (existingIndex !== -1) {
                // Only splice and unshift if it's not already the first item
                if (existingIndex > 0) {
                    const existingEntry = list.splice(existingIndex, 1)[0]; // Remove from current position
                    list.unshift(existingEntry); // Add to the beginning
                }
                // Entry already exists and is now at the front, nothing more to do
                return;
            }

            // --- Add New Entry ---
            // Create a placeholder with loading state
            const newEntry = {
                username,
                id: null,
                firstName: '',
                lastName: '',
                type,
                isDynamic: true,
                isLoading: true, // Indicate data fetching is in progress
                hasPictureError: false,
            };
            list.unshift(newEntry); // Add placeholder to the beginning

            // Enforce list size limit
            const maxSize = 5;
            if (list.length > maxSize) {
                list.length = maxSize; // Trim the list from the end efficiently
            }

            // Attempt to fetch user details if Apollo client is available
            if (this._client) {
                try {
                    // Fetch user data using the specific query
                    const { data } = await this._client.query({
                        query: FIND_USER_BY_USERNAME,
                        variables: { username },
                        fetchPolicy: 'network-only', // Ensure we get potentially updated user info
                    });

                    const user = data?.findUserByUsername;
                    // Find the placeholder entry we just added
                    const entryToUpdate = list.find(e => e.username === username && e.isLoading);

                    // If fetch was successful and placeholder still exists
                    if (user && entryToUpdate) {
                        // Update the entry with fetched data
                        entryToUpdate.id = user.id;
                        entryToUpdate.firstName = user.firstName;
                        entryToUpdate.lastName = user.lastName;
                        entryToUpdate.isLoading = false; // Mark loading as complete
                    } else if (entryToUpdate) {
                        // If user not found or placeholder gone, stop loading indicator
                        console.warn(`[SidebarStore] User '${username}' not found or entry disappeared.`);
                        entryToUpdate.isLoading = false;
                    }
                } catch (error) {
                    console.error(`[SidebarStore] Failed to fetch details for user ${username}:`, error);
                    // Find the entry again and stop loading on error
                    const failedEntry = list.find(e => e.username === username && e.isLoading);
                    if (failedEntry) {
                        failedEntry.isLoading = false;
                    }
                }
            } else {
                // If Apollo client wasn't ready, find the entry and stop loading
                console.warn('[SidebarStore] Apollo client not available for fetching user details.');
                const entryWithoutClient = list.find(e => e.username === username && e.isLoading);
                if (entryWithoutClient) {
                    entryWithoutClient.isLoading = false;
                }
            }
        },

        /**
         * Adds or updates a flashcard set in the 'recently visited' list.
         * Moves existing sets to the front upon revisit.
         * @param {object} setDetails - Contains set information.
         * @param {string|number} setDetails.id - The unique ID of the flashcard set.
         * @param {string} setDetails.title - The title of the flashcard set.
         * @returns {void}
         */
        addVisitedSet({ id, title }) {
            // Basic validation
            if (!id || !title) return;

            // Check if the set already exists
            const existingIndex = this.visitedFlashcardSets.findIndex(set => set.id === id);

            // If exists, move to the front if necessary
            if (existingIndex !== -1) {
                // Only move if not already first
                if (existingIndex > 0) {
                    const existingSet = this.visitedFlashcardSets.splice(existingIndex, 1)[0]; // Remove
                    this.visitedFlashcardSets.unshift(existingSet); // Add to start
                }
                return; // Already handled
            }

            // --- Add New Set Entry ---
            const newSetEntry = {
                id,
                title,
                type: 'set',
                isDynamic: true,
            };
            this.visitedFlashcardSets.unshift(newSetEntry); // Add to start

            // Enforce list size limit
            const maxSize = 5;
            if (this.visitedFlashcardSets.length > maxSize) {
                this.visitedFlashcardSets.length = maxSize; // Trim end
            }
        },

        /**
         * Adds or updates a search query in the 'recent searches' list.
         * Moves existing queries to the front upon re-search.
         * @param {string} query - The search term entered by the user.
         * @returns {void}
         */
        addRecentSearch(query) {
            // Basic validation and trimming
            if (!query) return;
            const trimmedQuery = query.trim();
            if (!trimmedQuery) return;

            // Prepare display name and path for the search entry
            const displayName = `"${trimmedQuery.length > 15 ? trimmedQuery.substring(0, 15) + '...' : trimmedQuery}"`;
            const searchPath = `/explore?q=${encodeURIComponent(trimmedQuery)}`;
            const entryType = 'search';

            // Check if this exact query already exists
            const existingIndex = this.recentSearchQueries.findIndex(s => s.query === trimmedQuery);

            // If exists, move to the front if necessary
            if (existingIndex !== -1) {
                // Only move if not already first
                if (existingIndex > 0) {
                    const existingSearch = this.recentSearchQueries.splice(existingIndex, 1)[0]; // Remove
                    this.recentSearchQueries.unshift(existingSearch); // Add to start
                }
                return; // Already handled
            }

            // --- Add New Search Entry ---
            this.recentSearchQueries.unshift({
                query: trimmedQuery,
                name: displayName,
                path: searchPath,
                type: entryType,
                isDynamic: true,
            }); // Add to start

            // Enforce list size limit
            const maxSize = 5;
            if (this.recentSearchQueries.length > maxSize) {
                this.recentSearchQueries.length = maxSize; // Trim end
            }
        },

        /**
         * Removes a specific entry (profile, library, set, or search) from its list.
         * @param {string | number} identifier - The unique identifier (username, set ID, or search query).
         * @param {'profile' | 'library' | 'set' | 'search'} type - The type of entry to remove.
         * @returns {void}
         */
        removeVisitedEntry(identifier, type) {
            let list;
            let findFn;

            // Select the correct list and the function to find the item based on type
            switch (type) {
                case 'profile':
                    list = this.visitedUserProfiles;
                    findFn = (entry) => entry.username === identifier;
                    break;
                case 'library':
                    list = this.visitedUserLibraries;
                    findFn = (entry) => entry.username === identifier;
                    break;
                case 'set':
                    list = this.visitedFlashcardSets;
                    findFn = (entry) => entry.id === identifier; // Sets identified by ID
                    break;
                case 'search':
                    list = this.recentSearchQueries;
                    findFn = (entry) => entry.query === identifier; // Searches identified by query string
                    break;
                default:
                    console.warn('[SidebarStore] Unknown type for removeVisitedEntry:', type);
                    return;
            }

            // Find the index using the determined function
            const index = list.findIndex(findFn);
            // If found, remove it using splice
            if (index !== -1) {
                list.splice(index, 1);
            }
        },

        /**
         * Flags a user profile/library entry if its associated picture failed to load.
         * UI components can use the `hasPictureError` flag to display a fallback.
         * @param {string} username - The username associated with the entry.
         * @param {'profile' | 'library'} type - The type of entry.
         * @returns {void}
         */
        setPictureError(username, type) {
            // Select the correct list
            const list = type === 'profile' ? this.visitedUserProfiles : this.visitedUserLibraries;
            // Find the specific entry
            const entry = list.find(e => e.username === username);
            // If found, set the flag
            if (entry) {
                entry.hasPictureError = true;
            }
        },

        /**
         * Clears all user-specific and session-specific state managed by this store.
         * Intended to be called during user logout to reset the sidebar.
         * @returns {void}
         */
        clearUserSpecificData() {
            // Reset all relevant state properties to their initial empty values
            this.expandedItems = new Set();
            this.visitedUserProfiles = [];
            this.visitedUserLibraries = [];
            this.visitedFlashcardSets = [];
            this.recentSearchQueries = [];
            // The persisted state plugin will automatically update sessionStorage
        },
    },

    // Configuration for pinia-plugin-persistedstate
    persist: {
        // Define which state properties should be saved
        paths: [
            'expandedItems',
            'visitedUserProfiles',
            'visitedUserLibraries',
            'recentSearchQueries',
            'visitedFlashcardSets',
        ],
        // Custom serializer/deserializer is necessary because JSON cannot handle Set objects directly.
        serializer: {
            /**
             * Custom serialization function to prepare state for JSON stringification.
             * Converts the `expandedItems` Set into an Array.
             * @param {object} state - The current store state.
             * @returns {string} - The JSON string representation of the modified state.
             */
            serialize: (state) => {
                const stateToSerialize = { ...state };
                // Convert the Set to an Array before saving
                if (stateToSerialize.expandedItems instanceof Set) {
                    stateToSerialize.expandedItems = Array.from(stateToSerialize.expandedItems);
                }
                return JSON.stringify(stateToSerialize);
            },
            /**
             * Custom deserialization function to restore state from a JSON string.
             * Converts the `expandedItems` Array back into a Set.
             * Ensures other persisted arrays are initialized correctly if missing.
             * @param {string} stateString - The JSON string retrieved from storage.
             * @returns {object} - The deserialized state object ready for the store.
             */
            deserialize: (stateString) => {
                const deserializedState = JSON.parse(stateString);
                // Convert the Array back to a Set after loading
                if (Array.isArray(deserializedState.expandedItems)) {
                    deserializedState.expandedItems = new Set(deserializedState.expandedItems);
                } else {
                    // Fallback to an empty Set if data is invalid or missing
                    deserializedState.expandedItems = new Set();
                }
                // Ensure arrays exist, defaulting to empty arrays if they were null/undefined in storage
                deserializedState.visitedUserProfiles = deserializedState.visitedUserProfiles || [];
                deserializedState.visitedUserLibraries = deserializedState.visitedUserLibraries || [];
                deserializedState.recentSearchQueries = deserializedState.recentSearchQueries || [];
                deserializedState.visitedFlashcardSets = deserializedState.visitedFlashcardSets || [];
                return deserializedState;
            },
        },
    },
});
