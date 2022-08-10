
import { ProductDao } from '../../daos/index.js';


const getProductById = async (id) => {
    try {
        const product = await ProductDao.getById(id);
        if (!product) throw 'producto no encontrado';
        return product;
    } catch (error) {
        console.log('Error: ', err);
    }
}
const getProducts = async () => {
    try {
        return await ProductDao.getAll();
    } catch (err) {
        console.log('Error: ', err);
    }
}
const saveProduct = async (data) => {
    try {
        const product = data;
        //validar cada dato de arriba ? o hacer eso en la squema de moongose
        const savedProductId = ProductDao.save(product);
        return savedProductId; //return saved product id
    } catch (error) {
        console.log('Error: ', err);
    }
}

const updateProduct = async (id, data) => {
    try {
        const updatedProductId = await ProductDao.updateById(id, data);
        if (id != updatedProductId){
            throw 'updatedProductId and given Id dont match, error'
        }
        return updatedProductId;
        
    } catch (error) {
        console.log('Error: ', err);
    }
}

const deleteProduct = async (id) => {
    try {
        const deletedProduct = await ProductDao.deleteById(id);
        return deletedProduct;
    } catch (error) {
        console.log('Error: ', err);
    }
}




export default { getProducts, getProductById, saveProduct, updateProduct, deleteProduct };