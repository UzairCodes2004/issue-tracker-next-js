import {z} from 'zod'
const registerSchema = z.object({

    name:z.string().min(1,"Name is required"),
    email:z.string().email("Invalid"),
    password:z.string().min(6,"Password must be  digit ")

})
export default registerSchema;