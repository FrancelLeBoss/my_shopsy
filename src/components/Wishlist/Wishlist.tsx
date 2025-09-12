import { IoCloseOutline } from "react-icons/io5";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import Swal from "sweetalert2";
import axios from "axios";
import axiosInstance from "../../api/axiosInstance";
import { login } from "../../redux/userSlice";
import {
  ProductVariant,
  VariantImage,
  WishlistItem,
} from "../../types/Product";
import { RootState } from "../../redux/store";

interface WishlistProps {
  wishlistPopup: boolean;
  setWishlistPopup: React.Dispatch<React.SetStateAction<boolean>>;
}

const Wishlist = ({ wishlistPopup, setWishlistPopup }: WishlistProps) => {
  const { user, isAuthenticated, accessToken } = useSelector(
    (state: RootState) => state.user
  );
  const wishlist = useSelector((state: RootState) => state.wishlist.items);
  const dispatch = useDispatch();
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (user) {
      fetchWishlist();
    }
  }, [user]);

  const handleLogin = async () => {
    try {
      const response = await axiosInstance.post<{
        access: string;
        refresh: string;
      }>(`${apiBaseUrl}api/token/`, {
        // simplejwt's TokenObtainPairView expects 'username' by default.
        username: username,
        password: password,
      });
      const { access, refresh } = response.data;
      const userDetailsResponse = await axiosInstance.get(
        `${apiBaseUrl}api/user/me/`,
        {
          headers: {
            Authorization: `Bearer ${access}`, // <-- Ajout manuel de l'en-tête ici
          },
        }
      );
      const userData = userDetailsResponse.data;
      dispatch(
        login({
          user: userData,
          access: access,
          refresh: refresh,
          rememberMe: false,
        })
      );
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const fetchWishlist = async () => {
    try {
      const response = await axios
        .get(
          `${apiBaseUrl}api/wishlist/`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`, // Assurez-vous que l'utilisateur a un accessToken valide
            },
          }
        )
        .then(async (response) => {
          const data = response.data as Array<{ id: number; variant: number }>;
          const items: WishlistItem[] = await Promise.all(
            data.map(async (item: { id: number; variant: number }) => {
              const variantResponse = await axios.get<ProductVariant>(
                `${apiBaseUrl}api/products/variant/${item.variant}/`
              );
              return {
                id: item.id,
                //user: item.user,
                variant: variantResponse.data, // Stocker la variante entière
              };
            })
          );
          // Dispatch pour mettre à jour la wishlist dans Redux
          dispatch({ type: "wishlist/updateWishlist", payload: items });
        });
    } catch (error) {
      console.error("Error fetching wishlist data:", error);
    }
  };

  // Fonction pour supprimer un élément de la wishlist
  interface RemoveWishlistResponse {
    wishlist_item: WishlistItem;
  }

  const handleRemoveFromWishlist = async (
    item: WishlistItem
  ): Promise<void> => {
    try {
      let itemDeleted: number | undefined;
      await axios
        .post<RemoveWishlistResponse>(`${apiBaseUrl}api/wishlist/remove/`, {
          user_id: user?.id,
          variant_id: item.variant?.id,
        })
        .then((response) => {
          console.log("Item removed from wishlist:", response.data);
          itemDeleted = response.data.wishlist_item.id;
        });
      // Met à jour le state Redux après suppression
      dispatch({
        type: "wishlist/removeFromWishlist",
        payload: { itemDeleted },
      });
      Swal.fire(
        "Supprimé",
        "Produit retiré de la liste de souhaits.",
        "success"
      );
    } catch (error) {
      Swal.fire("Erreur", "Impossible de retirer l'article.", "error");
    }
  };

  // Fonction pour vider la wishlist
  const handleClearWishlist = async () => {
    try {
      await axios.post(`${apiBaseUrl}api/wishlist/empty/`, {
        user_id: user?.id,
      });
      dispatch({ type: "wishlist/clearWishlist" });
      Swal.fire(
        "Liste vidée",
        "Votre liste de souhaits est maintenant vide.",
        "success"
      );
    } catch (error) {
      Swal.fire("Erreur", "Impossible de vider la liste.", "error");
      console.error("Error clearing wishlist:", error);
    }
  };

  const imageUrl = (images: VariantImage[] | undefined): string => {
    if (!images || images.length === 0) return "";
    for (let i = 0; i < images.length; i++) {
      if (images[i].mainImage) {
        return `${apiBaseUrl}${images[i].image}`;
      }
      return `${apiBaseUrl}${images[0].image}`;
    }
    return "";
  };

  return (
    <>
      {wishlistPopup && (
        <div className="popup">
          <div className="h-screen w-screen fixed top-0 left-0 bg-black/50 backdrop-blur-sm z-50">
            <div
              className="fixed top-1/2 left-1/3 -translate-y-1/2 p-4 shadow-md bg-white
                         dark:bg-gray-900 rounded-md duration-200 w-[400px]"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <h1 className="text-xl text-gray-800 dark:text-gray-300">
                  Liste des souhaits
                </h1>
                <div>
                  <IoCloseOutline
                    className="text-2xl cursor-pointer"
                    onClick={() => setWishlistPopup(false)}
                  />
                </div>
              </div>
              {user && (
                <div>
                  {/* wishlist items */}
                  <div className="overflow-auto max-h-[300px] mt-4">
                    {wishlist?.length > 0 ? (
                      wishlist?.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 border-b p-2  hover:bg-primary/20"
                        >
                          <img
                            src={imageUrl(item?.variant?.images)}
                            alt={item?.variant?.product?.title}
                            className="w-16 h-16 object-cover cursor-pointer"
                            title="See details"
                          onClick={() => {
                            window.location.href = `/product/${item?.variant?.product?.id}/${item?.variant?.id}`;
                          }}
                          />
                          <div className="flex flex-col gap-1 w-full">
                            <div className="text-lg text-gray-800 dark:text-gray-300 cursor-pointer" title="See details"
                          onClick={() => {
                            window.location.href = `/product/${item?.variant?.product?.id}/${item?.variant?.id}`;
                          }}>
                              {item.variant?.product?.title} (
                              {item.variant?.color})
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 flex gap-4 items-center font-semibold justify-between">
                              {/* Prix et taille sur la même ligne */}
                              <div className="flex items-center gap-1">
                                <span>{item.variant?.price}</span>
                                <span>$</span>
                              </div>
                              {/* Quantité et bouton Remove */}
                              <div className="flex items-center gap-2 justify-end w-full cursor-pointer">
                                <button
                                  className="text-red-500 hover:text-red-700"
                                  onClick={() => {
                                    handleRemoveFromWishlist(item);
                                  }}
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <h1 className="text-left text-gray-500 dark:text-gray-400">
                        Votre liste de souhaits est vide
                      </h1>
                    )}
                    {wishlist?.length > 0 && (
                      <div
                        className="text-xs flex items-center gap-2 underline text-red-600 cursor-pointer hover:text-red-700"
                        onClick={handleClearWishlist}
                      >
                        <span>clear the list</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {!user && (
                <div className="mt-4">
                  <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    Login to proceed
                  </div>
                  <input
                    type="text"
                    placeholder="Username"
                    className="w-full  border border-gray-300 dark:border-gray-500
                                    dark:bg-gray-800 px-3 py-2 focus:outline-primary/20 focus:outline-1 mb-4"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      className="w-full  border border-gray-300 dark:border-gray-500
                                    dark:bg-gray-800 px-3 py-2 focus:outline-primary/20 focus:outline-1 "
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-center group mt-4">
                <button
                  onClick={() => {
                    if (!user) {
                      handleLogin();
                    } else {
                      setWishlistPopup(false);
                    }
                  }}
                  className="text-white px-2 py-1 bg-primary hover:bg-secondary 
                                "
                >
                  {user ? "got it!" : "Register"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Wishlist;
