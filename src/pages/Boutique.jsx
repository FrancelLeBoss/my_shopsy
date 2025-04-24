import React, { useState, useEffect } from "react";
import { FiFilter } from "react-icons/fi";
import { BiDownArrowAlt } from "react-icons/bi";
import { GrDown, GrUp } from "react-icons/gr";
import CheckboxFilter from "../components/general/CheckBox";
import { Link } from "react-router-dom";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";

const ITEMS_PER_PAGE = 6;

export const new_price = (price, discount) => {
  if (!price || !discount) return 0;
  return (price - (price * discount) / 100).toFixed(2);
};

export const Boutique = ({_category}) => {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL; 
  const [showFilters, setShowFilters] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const user = useSelector((state) => state.user.user);
  const cart = useSelector((state) => state.cart.cart);
  const [genderClicked, setGenderClicked] = useState(false);
  const [priceClicked, setPriceClicked] = useState(false);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const [productHovered, setProductHovered] = useState(-1);
  const [photoHovered, setPhotoHovered] = useState(null);
  const [filtered, setFiltered] = useState(null);
  const [selected, setSelected] = useState(null);
  const [genderFilter, setGenderFilter] = useState([]);
  const [priceFilter, setPriceFilter] = useState([]);
  const [sortingCriteria, setSortingCriteria] = useState("");
  const [displaySorting, setDisplaySorting] = useState(true);
  const [ProductsData, setProductsData] = useState([]);
  const [subCategoryList, setSubCategoryList] = useState([]);
  const [categoryDetails, setCategoryDetails] = useState({});
  
  useEffect(() => {
    axios.get(`${apiBaseUrl}api/products/category/${_category}/`)
      .then(response => setProductsData(response.data))
      .catch(error => console.error("Error fetching data:", error));

    axios.get(`${apiBaseUrl}api/categories/${_category}/subcategories`)
      .then(response => setSubCategoryList(response.data))
      .catch((error) => {
        console.error("Error fetching subcategories:", error);
      });

    axios.get(`${apiBaseUrl}api/categories/${_category}/`)
      .then(response => {
        setCategoryDetails(response.data);
      })
      .catch((error) => {
        console.error("Error fetching category details:", error);
      });

  }, [_category]);

  useEffect(() => {
    if (user) {
        axios
            .get(`${apiBaseUrl}api/cart/${user?.id}/`)
            .then(async (response) => {
                const cartData = response.data;
                console.log("User ", user?.id, " cart data: ", cartData);

                // Récupérer les détails de chaque variante
                const items = await Promise.all(
                    cartData.map(async (item) => {
                        const variantResponse = await axios.get(`${apiBaseUrl}api/products/variant/${item.variant}/`);
                        const sizeResponse = await (await axios.get(`${apiBaseUrl}api/products/size/${item.size}/`))
                        return {
                            id: item.id,
                            variant: variantResponse.data, // Stocker la variante entière
                            size: sizeResponse.data, // Stocker la taille entière
                            quantity: item.quantity,
                        };
                    })
                );

                // Dispatch pour mettre à jour le panier dans Redux
                dispatch({ type: 'cart/updateCart', payload: items });
            })
            .catch((error) => console.error("Error fetching data:", error));
    }
}, [user]);

  const productsBySubCategory =(subCat)=>{
    const filteredProducts = ProductsData.filter(
      (product) => product.subCategory === subCat
    );
    return filteredProducts;
  };

  const totalPages = () => {
    let ProductFiltered = ProductsData;
    if (filtered && filtered.value) {
      ProductFiltered = ProductFiltered.filter(
        (p) => p.subCategory === filtered.value
      );
    }
    if (genderFilter.length > 0) {
      ProductFiltered = ProductFiltered.filter((p) =>
        genderFilter.includes(p.gender)
      );
    }
    if (priceFilter.length > 0) {
      ProductFiltered = ProductFiltered.filter(
        (p) => p?.variants[0]?.price <= Math.max(...priceFilter.map((v) => v || 0))
      );
    }
    return Math.ceil(ProductFiltered.length / ITEMS_PER_PAGE);
  };

  const getHighestPrice = (products) => {
    return Math.max(...products.map((p) => p?.variants[0]?.price || 0));
  };
  const getLowestPrice = (products) => {
    return Math.min(...products.map((p) => p?.variants[0]?.price || 0));
  };
  const getMedianPrice = (products) => {
    const prices = products
      .map((p) => parseFloat(p?.variants[0]?.price) || 0)
      .filter((price) => !isNaN(price))
      .sort((a, b) => a - b);

    if (prices.length === 0) return 0; // Gérer le cas où il n'y a aucun prix

    const mid = Math.floor(prices.length / 2);

    // Si le nombre d'éléments est impair, prendre l'élément du milieu
    // Si le nombre d'éléments est pair, faire la moyenne des deux valeurs centrales
    return prices.length % 2 !== 0
      ? prices[mid]
      : (prices[mid - 1] + prices[mid]) / 2;
  };

const thereIsDiscount = (product) => {
  if (!product?.variants || product.variants.length === 0) return [];

  // Trouver la variante avec le plus grand rabais
  return product.variants.reduce(
    (maxDiscount, variant, index) => {
      if (variant.discount > maxDiscount[0]) {
        return [variant.discount, index];
      }
      return maxDiscount;
    },
    [0, -1] // Valeur initiale : [discount, index]
  );
};

  const displayedProducts = () => {
    let filteredProducts = ProductsData;

    if (filtered) {
      filteredProducts = filteredProducts.filter(
        (product) => {
          return product.subCategory === filtered.value;
        }
      );
    }

    if (genderFilter.length > 0) {
      filteredProducts = filteredProducts.filter((product) =>
        genderFilter.includes(product.gender)
      );
    }
    if (priceFilter.length > 0) {
      filteredProducts = filteredProducts.filter(
        (p) => p?.variants[0]?.price <= Math.max(...priceFilter.map((v) => v || 0))
      );
    }
    return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  };

  const handleFilterChange = (newSelected) => {
    setGenderFilter(newSelected);
  };
  const handleFilterPriceChange = (newSelected) => {
    setPriceFilter(newSelected);
  };
  const handleSorting = (c) => {
    setSortingCriteria(c);
  };
  const sortedProducts = () => {
    if (sortingCriteria === "default" || sortingCriteria === "") {
      return displayedProducts();
    } else if (sortingCriteria === "by name") {
      return displayedProducts().sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortingCriteria === "by price") {
      return displayedProducts().sort((a, b) => a?.variants[0]?.price - b?.variants[0]?.price);
    }
  };

  const indexOfMainImageOfvariant = (variant) => {
    const index = variant.images.findIndex((image) => image.mainImage === true);
    return index !== -1 ? index : 0; // Retourne l'index ou 0 si non trouvé
  }

  useEffect(() => {
    setCurrentPage(1); // Remettre à la première page après filtrage
  }, [filtered, genderFilter]);

  return (
    <div className="bg-gray-100 min-h-screen pb-4 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-primary/40 py-3">
        <div className="text-xl text-secondary text-center font-semibold uppercase">
        {categoryDetails?.title ? categoryDetails.title : "Loading..."}
        </div>
      </div>
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-600 dark:text-gray-200 font-medium capitalize">
          Home / {categoryDetails?.title?categoryDetails.title:<span className="animate-pulse">Loading...</span>}
        </div>

        {/* Title & Sorting */}
        <div className="flex justify-between items-center mt-3">
          <h1 className="lg:text-3xl md:text-2xl text-xl font-medium">
            {categoryDetails?.short_desc ? categoryDetails.short_desc + "("+ProductsData?.length+")" : "Loading..."}
          </h1>
          <div className="flex items-center gap-4 text-base md:text-lg font-normal">
            <button
              className="flex items-center gap-2 cursor-pointer hover:bg-primary/60 dark:bg-transparent dark:hover:text-secondary dark:border-1 dark:border-primary bg-gray-200 px-3 py-1 rounded-md"
              onClick={() => setShowFilters(!showFilters)}
            >
              <span>{showFilters ? "Hide Filters" : "Show Filters"}</span>
              <FiFilter />
            </button>
            <div
              className="relative"
              onMouseEnter={() => setDisplaySorting(true)}
              onMouseLeave={() => setDisplaySorting(false)}
            >
              <button className="cursor-pointer group flex items-center px-3 py-1 gap-2 transition-all duration-200 rounded-md hover:text-secondary">
                <span>Sort By</span>
                <BiDownArrowAlt className="group-hover:rotate-180" />
              </button>
              {
                <div
                  className={`${
                    displaySorting ? "" : "hidden"
                  } dark:bg-gray-900 bg-gray-50 w-full p-3 top-8
                 absolute text-xs text-gray-700`}
                >
                  <CheckboxFilter
                    options={["by name", "by price"]}
                    labels={[
                      "By name",
                      "By price",
                    ]}
                    uniqueSelection={true}
                    onFilterChange={handleSorting}
                  />
                </div>
              }
            </div>
          </div>
        </div>
        {/* Content Grid */}
        <div className="flex mt-4">
          {/* Sidebar Filtres */}
          {showFilters && (
            <div className="flex flex-col gap-4 w-1/4 p-4 dark:border-none border-r border-gray-300 bg-white dark:bg-gray-900 shadow-md rounded-md">
              <div className="">
                <h2 className="text-lg font-semibold">Filters</h2>
                <ul className="mt-2 space-y-2 text-gray-400 fon">
                  {subCategoryList.map((category) => (
                    <li
                      key={category?.id} // Utilisez une clé unique basée sur `category.id`
                      className={`cursor-pointer hover:text-primary capitalize ${
                        selected === category?.id
                          ? "text-primary"
                          : " dark:text-gray-400 text-gray-700"
                      }`}
                      onClick={() => {
                        if (filtered?.value !== category?.id) {
                          setFiltered({
                            type: "sub_categorie",
                            value: category?.id,
                          });
                          setSelected(category?.id);
                        } else {
                          setFiltered(null);
                          setSelected(null);
                        }
                      }}
                    >
                      {(() => {
                        const products = productsBySubCategory(category?.id);
                        return products.length > 0 ? `${category?.title} (${products.length})` : null;
                      })()}
                    </li>
                  ))}
                </ul>
              </div>
              <hr className="font-medium text-gray-700" />
              <div className="flex flex-col cursor-pointer gap-2">
                <div
                  className="flex justify-between font-medium"
                  onClick={() => setGenderClicked(!genderClicked)}
                >
                  <span>Gender</span>
                  {genderClicked ? <GrUp /> : <GrDown />}
                </div>
                <div className={`${genderClicked ? "block" : "hidden"}`}>
                  <CheckboxFilter onFilterChange={handleFilterChange} />
                </div>
              </div>
              <hr className="font-medium text-gray-700" />
              <div className="flex flex-col cursor-pointer gap-2">
                <div
                  className="flex justify-between font-medium"
                  onClick={() => setPriceClicked(!priceClicked)}
                >
                  <span>Filter by price</span>
                  {priceClicked ? <GrUp /> : <GrDown />}
                </div>
                <div className={`${priceClicked ? "block" : "hidden"}`}>
                  <CheckboxFilter
                    options={[
                      getLowestPrice(ProductsData),
                      getMedianPrice(ProductsData),
                      getHighestPrice(ProductsData),
                    ]}
                    labels={[
                      getLowestPrice(ProductsData),
                      getMedianPrice(ProductsData),
                      getHighestPrice(ProductsData),
                    ]}
                    onFilterChange={handleFilterPriceChange}
                    extra={"$"}
                  />
                </div>
              </div>
              <hr className="font-medium text-gray-700" />
            </div>
          )}

          {/* Product Grid */}
          <div
            className={`grid gap-3 ${
              showFilters ? "w-3/4" : "w-full lg:grid-cols-4"
            } grid-cols-1 sm:grid-cols-2 md:grid-cols-3 pl-4`}
          >
            {sortedProducts()?.map((item) => (
              <div
                className="dark:bg-gray-900 bg-white pb-2 shadow-md hover:shadow-lg "
                key={item.id}
              >
                <Link to={`/product/${item.id}/${productHovered === item.id && photoHovered?.index !== undefined?photoHovered.index :item.variants[0].id}`}>
                  <img
                    src={
                      productHovered === item.id && photoHovered?.index !== undefined
                        ? photoHovered.img
                        : apiBaseUrl + item?.variants[0]?.images[indexOfMainImageOfvariant(item?.variants[0])]?.image
                    }
                    alt={item.title}
                    className="w-full h-64 object-cover hover:outline-primary hover:outline hover:outline-1"
                  />
                </Link>
                {productHovered !== item.id && (
                  <div
                    className="mt-2 px-2"
                    onMouseEnter={() => {
                      setProductHovered(item.id);
                      setPhotoHovered(null);
                    }}
                    onMouseLeave={() => setProductHovered(-1)}
                  >
                    <span className="font-semibold text-secondary">
                      {item.title}
                    </span>
                    <span className="block text-gray-500 text-base">
                      {item.short_desc}
                    </span>
                    <div
                      className={`flex items-center text-secondary font-medium text-lg `}
                    >
                      ${thereIsDiscount(item).length > 0
                        ? new_price(item?.variants[0]?.price, item.variants[thereIsDiscount(item)[1]]?.discount)
                        : item?.variants[0]?.price}
                      {thereIsDiscount(item).length > 0 && (
                        <s className="ml-1 text-gray-500">${item?.variants[0]?.price}</s>
                      )}
                      {thereIsDiscount(item).length > 0 && (
                        <h3 className="ml-1 text-green-600">
                          {item.variants[thereIsDiscount(item)[1]]?.discount}% discount
                        </h3>
                      )}
                    </div>
                  </div>
                )}
                {/* Affichage conditionnel au survol */}
                {productHovered === item.id && (
                  <div
                    className="mt-2 p-2 rounded-md text-sm text-gray-700 flex flex-col gap-2"
                    //onMouseLeave={() => setProductHovered(-1)}
                  >
                    <div className="flex gap-1 items-center">
                      {item?.variants.map((element) => (
                        <Link to={`/product/${item.id}/${element?.id}`} key={element.id}>
                          <img
                            src={apiBaseUrl+element?.images[indexOfMainImageOfvariant(element)]?.image}
                            className="w-10 h-10 hover:outline hover:outline-primary hover:outline-1"
                            onMouseEnter={() =>
                              setPhotoHovered({ img: apiBaseUrl+element?.images[indexOfMainImageOfvariant(element)]?.image, index: element.id })
                            }
                            //onMouseLeave={() => setPhotoHovered(null)}
                            onClick={() =>
                              (window.location.href = `/product/${item.id}/${element?.id}`)
                            }
                          />
                        </Link>
                      ))}
                    </div>
                    <div
                      className={`flex items-center text-secondary font-medium text-lg `}
                    >
                      ${thereIsDiscount(item).length > 0
                        ? new_price(
                            item?.variants[0]?.price,
                            item.variants[thereIsDiscount(item)[1]]?.discount
                          ):  
                          item?.variants[0]?.price}
                      {thereIsDiscount(item).length > 0 && (
                        <s className="ml-1 text-gray-500">${item?.variants[0]?.price}</s>
                      )}
                      {thereIsDiscount(item).length > 0 && (
                        <h3 className="ml-1 text-green-600">
                          {item.variants[thereIsDiscount(item)[1]]?.discount}% discount
                        </h3>
                      )}
                      {/* Affichage du rabais s'il y en a un */}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        {/* Pagination */}
        <div className="flex justify-end mt-6 gap-2">
          <button
            className="px-3 py-1 dark:bg-gray-900 bg-gray-300 rounded-md disabled:opacity-50"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Prev
          </button>
          <span className="px-4 py-1 dark:bg-gray-900 bg-white dark:border-none border rounded-md">
            {currentPage} / {totalPages()}
          </span>
          <button
            className="px-3 py-1 dark:bg-gray-900 bg-gray-300 rounded-md disabled:opacity-50"
            onClick={() => setCurrentPage((prev) =>
              Math.min(prev + 1, totalPages())
            )}
            disabled={currentPage === totalPages()}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Boutique;
