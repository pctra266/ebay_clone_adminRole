import React, { useState, useEffect } from 'react';
import { productService } from '../services/productService';

export const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const data = await productService.getAllProducts();
                console.log("Dữ liệu sản phẩm nhận được:", data);
                setProducts(data);
            } catch (error) {
                console.error("Không thể tải dữ liệu", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    if (loading) {
        return <p>Đang tải danh sách sản phẩm...</p>;
    }

    return (
        <div>
            <h2>Danh sách Sản Phẩm (Gọi bằng Axios Custom)</h2>
            <ul>
                {products.length === 0 ? (
                    <li>Chưa có sản phẩm nào.</li>
                ) : (
                    products.map((product) => (
                        <li key={product.id}>
                            {product.title} - Giá: {product.price}
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
};