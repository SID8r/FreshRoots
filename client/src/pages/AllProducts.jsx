import React, { useEffect,useState  } from 'react'
import { useAppContext } from '../context/AppContext';
import ProductCard from '../components/productCard';

const AllProducts = () => {
    const{searchQuery,products}=useAppContext();
    const[filteredProducts,setFilteredProducts]=useState([]);
    useEffect(()=>{
        if(searchQuery.length>0){
            setFilteredProducts(products.filter((product)=>product.name.toLowerCase().includes(searchQuery.toLowerCase())));
        }
        else{
            setFilteredProducts(products);
        }
    },[products,searchQuery]);
  return (
    <div className='mt-16 flex flex-col'>
      <div className='flex flex-col w-max items-end'>
        <p className='text-2xl font-medium uppercase'>All Products</p>
        <div className='w-16 h-0.5 rounded-full bg-primary'></div>
      </div>
      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 md:gap-6 gap-3 lg:grid-cols-5 mt-6'>
        {filteredProducts.filter((product)=>product.inStock).map((product,index)=>(
            <ProductCard key={index} product={product}/>
        ))}
      </div>

    </div>
  )
}

export default AllProducts
