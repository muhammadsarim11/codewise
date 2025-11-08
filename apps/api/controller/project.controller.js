import prisma from "../config/prisma.js"


export const CreateProject = async (req,res)=>{

    const {name,description} = req.body
    try {
        
if(!name || !description){
    return res.status(400).json({message:"Name and Description are required"})
}
if(name.length < 3){
    return res.status(400).json({message:"Name must be at least 3 characters long"})
}

console.log(
    name,
    description,
    req.user.id
)
const project = await prisma.Project.create({
data:{
    name,
    description,
    userId:req.user.id
}    
})

return res.status(200).json({
    message:"created succesfully",
    project
})
    } catch (error) {
        return res.status(500).json({message:"Internal Server Error"})
    }

}



export const EditProject = async (req,res)=>{
    const {name , description} = req.body

    const {id} = req.params
    try {
        if(!name || !description){
            return res.status(400).json({message:"Name and Description are required"})
        }
        if(name.length < 3){
            return res.status(400).json({message:"Name must be at least 3 characters long"})
        }
       const project = await prisma.Project.update({
        where:{
            id:id
        },
        data:{
            name,
            description
        }
       })
       return res.status(200).json({
        message:"Updated Successfully",
        project
       })
    }   
        
    catch (error) {
        return res.status(500).json({message:"Internal Server Error"})
    }

}


export const DeleteProject = async (req,res)=>{
    const {id} = req.params
    try {   
        const project = await prisma.Project.delete({
            where:{
                id:parseInt(id)
            }
              })
            return res.status(200).json({   
            message:"Deleted Successfully",
            project
           })
    }
        catch (error) { 
        return res.status(500).json({message:"Internal Server Error"})
    }

}

export const getProject = async (req,res)=>{

    const id = req.user.id

    if(!id){
        return res.status(400).json({
            message:"invalid token"
        })
    }
    const projects = await prisma.Project.findMany({
      where: { userId: id },
    });


    return res.status(200).json({
    message:"fetched successfully!",
    projects
    })




}