import React from 'react'
import { useParams } from 'react-router-dom'
import { useAppContext } from '../context/AppContext';
import { categories } from '../assets/assets';
import ProductCard from '../components/productCard';

const ProductCategory = () => {
    const {category}=useParams();
    const {products}=useAppContext();

    const searchCategory=categories.find((item)=>item.path.toLowerCase()===category);
    const filteredProducts=products.filter((product)=>product.category.toLowerCase()===category);
  return (
    <div className='mt-16 flex flex-col'>
      {searchCategory && (
        <div className='flex flex-col w-max items-end'>
        <p className='text-2xl font-medium uppercase'>{searchCategory.text}</p>
        <div className='w-16 h-0.5 rounded-full bg-primary'></div>
      </div>
      )}
      {filteredProducts.length>0 ? (
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 md:gap-6 gap-3 lg:grid-cols-5 mt-6'>
        {filteredProducts.map((product)=>(
            <ProductCard key={product._id} product={product}/>
        ))}
        </div>
        ):
        <div className='flex items-center justify-center h-[60vj]'> 
            <p className='text-2xl font-medium text-primary'>No Product Found In This Category!!! </p>
        </div>
      }
    
    </div>
  )
}

export default ProductCategory
