import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import '../../style/addProduct.css'
import ApiService from "../../service/ApiService";
import { uploadToCloudinary } from "../../utils/cloudinaryUpload";

const AddProductPage = () => {

    const [image, setImage] = useState(null);
    const [categories, setCategories] = useState([]);
    const [categoryId, setCategoryId] = useState('');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [message, setMessage] = useState('');
    const [price, setPrice] = useState('');
    const [previewUrl, setPreviewUrl] = useState('');
    const [sizeName, setSizeName] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        ApiService.getAllCategory().then((res) => setCategories(res.categoryList));
    }, [])

    const handleImage = (e) => {
        const file = e.target.files[0];
        setImage(file);
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };




    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const imageUrl = await uploadToCloudinary(image);

            const formData = new FormData();
            formData.append('imageUrl', imageUrl);
            // formData.append('image', image);
            formData.append('categoryId', categoryId);
            formData.append('name', name);
            formData.append('description', description);
            formData.append('price', price);
            formData.append('sizeName', sizeName);

            const response = await ApiService.addProduct(formData);
            if (response.status === 200) {
                setMessage(response.message)
                setTimeout(() => {
                    setMessage('')
                    navigate('/admin/products')
                }, 3000);
            }

        } catch (error) {
            setMessage(error.response?.data?.message || error.message || 'unable to upload product')
        }
    }

    return(
        <div>
            <form onSubmit={handleSubmit} className="product-form">
                <h2>Add Product</h2>
                {message && <div className="message">{message}</div>}
                <input type="file" onChange={handleImage}/>
                {previewUrl && (
                    <div style={{ marginTop: '10px' }}>
                        <img
                            src={previewUrl}
                            alt="Preview"
                            style={{ maxWidth: '200px', border: '1px solid #ccc', borderRadius: '5px' }}
                        />
                    </div>
                )}
                <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                        <option value={cat.id} key={cat.id}>{cat.name}</option>
                    ))}
                </select>
                <input type="text"
                       placeholder="Product name"
                       value={name}
                       onChange={(e) => setName(e.target.value)}/>

                <textarea
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}/>

                <input type="number"
                       placeholder="price"
                       value={price}
                       onChange={(e) => setPrice(e.target.value)}/>
                <input
                    type="text"
                    placeholder="Size (S, M, L, XL XXL)"
                    value={sizeName}
                    onChange={(e) => setSizeName(e.target.value)}
                />


                <button type="submit">Add Product</button>
            </form>
        </div>
    )

}
export default AddProductPage;