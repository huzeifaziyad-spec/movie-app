import { Client, Databases, Query, ID, Account } from "appwrite";

const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;
const WATCHLIST_COLLECTION_ID = import.meta.env.VITE_APPWRITE_WATCHLIST_COLLECTION_ID;
const ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT;

const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID);

const database = new Databases(client);
const account = new Account(client);

export const updateSearchCount = async (searchTerm, movie) => {
  try {
    // 1. Check if search term already exists
    const result = await database.listDocuments(
      DATABASE_ID,
      COLLECTION_ID,
      [Query.equal("searchTerm", searchTerm)]
    );

    // 2. If it exists → increment count
    if (result.documents.length > 0) {
      const doc = result.documents[0];

      await database.updateDocument(
        DATABASE_ID,
        COLLECTION_ID,
        doc.$id,
        {
          count: doc.count + 1,
        }
      );
    }
    // 3. If it does NOT exist → create new document
    else {
      await database.createDocument(
        DATABASE_ID,
        COLLECTION_ID,
        ID.unique(),
        {
          searchTerm,
          count: 1,
          movie_id: movie.id,
          poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
        }
      );
    }
  } catch (error) {
    console.log("Error updating search count:", error);
  }
};
// get top 5 movies
export const getTrendingMovies = async () => {
  try {
    const result = await database.listDocuments(
      DATABASE_ID,
      COLLECTION_ID,
      [Query.limit(5),
      Query.orderDesc("count"),
      ],
    );
    return result.documents;

  } catch (error) {
    console.log("Error fetching trending searches:", error);
    return [];
  }
};

// Authentication helper
let cachedUserId = null;
export const getUserId = async () => {
  if (cachedUserId) return cachedUserId;
  try {
    const user = await account.get();
    cachedUserId = user.$id;
    return cachedUserId;
  } catch (error) {
    try {
      const session = await account.createAnonymousSession();
      cachedUserId = session.userId;
      return cachedUserId;
    } catch (sessionError) {
      console.error("Error creating anonymous session:", sessionError);
      return null;
    }
  }
};

// Watchlist functions
export const addToWatchlist = async (movie) => {
  try {
    const userId = await getUserId();
    if (!userId) return;

    await database.createDocument(
      DATABASE_ID,
      WATCHLIST_COLLECTION_ID,
      ID.unique(),
      {
        movie_id: String(movie.id),
        title: movie.title,
        poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
        vote_average: movie.vote_average,
        release_date: movie.release_date,
        user_id: userId,
      }
    );
  } catch (error) {
    console.error("Error adding to watchlist:", error);
    throw error;
  }
};

export const removeFromWatchlist = async (movieId) => {
  try {
    const userId = await getUserId();
    if (!userId) return;

    const result = await database.listDocuments(
      DATABASE_ID,
      WATCHLIST_COLLECTION_ID,
      [
        Query.equal("movie_id", String(movieId)),
        Query.equal("user_id", userId),
      ]
    );

    if (result.documents.length > 0) {
      await database.deleteDocument(
        DATABASE_ID,
        WATCHLIST_COLLECTION_ID,
        result.documents[0].$id
      );
    }
  } catch (error) {
    console.error("Error removing from watchlist:", error);
    throw error;
  }
};

export const getWatchlist = async () => {
  try {
    const userId = await getUserId();
    if (!userId) return [];

    const result = await database.listDocuments(
      DATABASE_ID,
      WATCHLIST_COLLECTION_ID,
      [Query.equal("user_id", userId)]
    );
    return result.documents;
  } catch (error) {
    console.error("Error fetching watchlist:", error);
    return [];
  }
};

export const checkIfInWatchlist = async (movieId) => {
  try {
    const userId = await getUserId();
    if (!userId) return false;

    const result = await database.listDocuments(
      DATABASE_ID,
      WATCHLIST_COLLECTION_ID,
      [
        Query.equal("movie_id", String(movieId)),
        Query.equal("user_id", userId),
      ]
    );
    return result.documents.length > 0;
  } catch (error) {
    console.error("Error checking watchlist:", error);
    return false;
  }
};
