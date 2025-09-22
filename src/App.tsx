import { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/navbar/Navbar";
import Footer from "./components/Footer/Footer";
import Cart from "./components/Cart/Cart";
import Wishlist from "./components/Wishlist/Wishlist";
import AOS from "aos";
import "aos/dist/aos.css";
import { Boutique } from "./pages/Boutique";
import Product from "./pages/Product";
import Home from "./pages/Home";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import { useDispatch, useSelector } from "react-redux";
// Importez la nouvelle action 'rehydrateAuth' de votre userSlice
import { rehydrateAuth } from "./redux/userSlice";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import AccountActivation from "./pages/AccountActivation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Profile from "./pages/Profile";
import Help from "./pages/Help";

function App() {
  // Création d'une instance de QueryClient
  const queryClient = new QueryClient();
  const dispatch = useDispatch();
  const [orderPopup, setOrderPopup] = useState(false);
  const [wishlistPopup, setWishlistPopup] = useState(false);
  const [_category, setCategory] = useState(1);
  const [message, setMessage] = useState("");

  const handleOrderPopup = () => {
    setOrderPopup(!orderPopup);
  };

  const handleWishlistPopup = () => {
    setWishlistPopup(!wishlistPopup);
  };

  // Initialisation de AOS pour les animations
  useEffect(() => {
    AOS.init({
      offset: 100,
      duration: 800,
      easing: "ease-in-sine",
      delay: 100,
    });
    AOS.refresh();
  }, []);

  // --- MISE À JOUR DE LA LOGIQUE DE REHYDRATATION ---
  // Déclenche la rehydration de l'état d'authentification au démarrage de l'application
  // Ceci remplace l'ancien useEffect qui lisait directement localStorage.
  useEffect(() => {
    dispatch(rehydrateAuth());
  }, [dispatch]); // La dépendance à 'dispatch' est nécessaire pour React

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="bg-white dark:bg-gray-900 dark:text-white duration-200 font-sans">
          <Navbar
            handleOrderPopup={handleOrderPopup}
            handleWishlistPopup={handleWishlistPopup}
          />

          <Routes>
            <Route
              path="/"
              element={
                <Home handleOrderPopup={handleOrderPopup} message={message} />
              }
            />
            <Route path="/category/:slug" element={<Boutique />} />
            <Route path="/product/:productId/:v" element={<Product />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/activate" element={<AccountActivation />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/help" element={<Help />} />
            <Route
              path="*"
              element={<h1 className="text-center text-4xl">404 Not Found</h1>}
            />
          </Routes>
          <Footer />
          <Cart orderPopup={orderPopup} setOrderPopup={setOrderPopup} />
          <Wishlist
            wishlistPopup={wishlistPopup}
            setWishlistPopup={setWishlistPopup}
          />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
