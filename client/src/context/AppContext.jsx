import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { dummyProducts } from "../assets/assets";
import { toast } from "react-hot-toast";
import axios from 'axios';

axios.defaults.withCredentials=true;
axios.defaults.baseURL=import.meta.env.VITE_BACKEND_URL;

export const AppContext =createContext();
export const AppContextProvider = ({children}) =>{
    const currency=import.meta.env.VITE_CURRENCY;
    const navigate = useNavigate();
    const [user,setUser]=useState(false);
    const [isSeller,setIsSeller]=useState(false);
    const [showUserLogin ,setShowUserLogin]=useState(false);
    const [products,setProducts]=useState([]);
    const [cartItems,setCartItems]=useState({});
    const [searchQuery,setSearchQuery]=useState({});


    // Fetch User Status ,userData, cartItems

    const fetchUser=async()=>{
        try {
            const {data}=await axios.get('/api/user/is-auth');
        if(data.success){
            setUser(data.user);
            setCartItems(data.user.cartItems);
        }
        } catch (error) {
            setUser(null);
            setCartItems({});
            navigate("/login");
            toast.error("Session expired. Please log in again.");
        }
    }

    //Fetch seller Status
    
    const fetchSeller=async()=>{
        try {
            const {data}=await axios.get('/api/seller/is-auth');
            if(data.succes){
                setIsSeller(true);
            }
            else{
                setIsSeller(false);
            }
        } catch (error) {
            setIsSeller(false);
        }
    }

    // to fetch products
    const fetchProducts=async()=>{
        try {
            const {data}=await axios.get('/api/product/list');
            if(data.success){
                setProducts(data.products);
            }
            else{
                toast.error(data.message);
                        }
        } catch (error) {
            toast.error(error.message);
        }
    };
    useEffect(()=>{
        fetchProducts();
        fetchSeller();
        fetchUser();
    },[]);
    // TO UPDATE CART ITEMS (BACKEND)

    useEffect(()=>{
        const updateCart=async()=>{
            try {
                const {data}=await axios.post('/api/cart/update',{cartItems});
                if(!data.success){
                    toast.error(data.message);
                }
            } catch (error) {
                toast.error(error.message);
            }
        }
        if(user){
            updateCart();
        }
    },[cartItems])

    // to update cart items
    const addToCart=(itemId)=>{
        let cartData=structuredClone(cartItems);
        if(cartData[itemId]){
            cartData[itemId]+=1;
        }
        else{
            cartData[itemId]=1;
        }
        setCartItems(cartData);
        toast.success("Added to cart")
    }
    // Update cart items
    const updateCartItems=(itemId,quantity)=>{
        let cartData=structuredClone(cartItems);
        cartData[itemId]=quantity;
        setCartItems(cartData);
        toast.success("Cart updated");
    }
    // Remove item from cart
    const removeFromCart=(itemID)=>{
        let cartData=structuredClone(cartItems);
        if(cartData[itemID])cartData[itemID]-=1;
        if(cartData[itemID]===0)delete cartData[itemID];
        toast.success("Removed from Cart");
        setCartItems(cartData);
    }
    
    //To get the cart count
    const getCartCount=()=>{
        let totalCount=0;
        for(const item in cartItems){
            totalCount+=cartItems[item];
        }
        return totalCount
    }

    // To get the total amount in the cart 

    const getCartAmount=()=>{
        let totalAmount=0;
        for(const item in cartItems){
            let itemInfo=products.find((product)=>product._id===item);
            if(cartItems[item]>0){
                totalAmount+=itemInfo.offerPrice*cartItems[item];
            }
        }
        return Math.floor(totalAmount*100)/100;
    }
    const value={navigate,user,setUser,isSeller,setIsSeller,showUserLogin 
    ,setShowUserLogin,products,fetchProducts,currency,cartItems,addToCart,setCartItems,updateCartItems,
    removeFromCart,searchQuery,setSearchQuery,getCartAmount,getCartCount,axios};


    return <AppContext.Provider value={value}>
        {children}
    </AppContext.Provider>
}
export const useAppContext=()=>{
    return useContext(AppContext);
}