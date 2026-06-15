import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import MovieDetail from "./pages/MovieDetail";
import PersonDetail from "./pages/PersonDetail";
import Watchlist from "./pages/Watchlist";
import TVDetail from "./pages/TVDetail";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/movie/:id",
    element: <MovieDetail />,
  },
  {
    path: "/tv/:id",
    element: <TVDetail />,
  },
  {
    path: "/person/:id",
    element: <PersonDetail />,
  },
  {
    path: "/watchlist",
    element: <Watchlist />,
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
