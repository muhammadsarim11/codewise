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

const project = await prisma.project.create({
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
        console.error('CreateProject error:', error)
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

       // Scope the write to the owner. updateMany (rather than update) is what
       // lets a non-unique userId into the where clause; count tells us whether
       // the row existed AND belonged to this user, without a second query.
       const {count} = await prisma.project.updateMany({
        where:{
            id: id,
            userId: req.user.id
        },
        data:{
            name,
            description
        }
       })

       // 404 rather than 403: a probing user learns nothing about whether the
       // id exists, only that it isn't theirs to see.
       if(count === 0){
        return res.status(404).json({message:"Project not found"})
       }

       const project = await prisma.project.findUnique({where:{id: id}})

       return res.status(200).json({
        message:"Updated Successfully",
        project
       })
    }   
        
    catch (error) {
        console.error('EditProject error:', error)
        return res.status(500).json({message:"Internal Server Error"})
    }

}


export const DeleteProject = async (req,res)=>{
    const {id} = req.params
    try {   
        const {count} = await prisma.project.deleteMany({
            where:{
                id: id,
                userId: req.user.id
            }
        })

        if(count === 0){
            return res.status(404).json({message:"Project not found"})
        }

        return res.status(200).json({   
            message:"Deleted Successfully",
            id
        })
    }
        catch (error) { 
        console.error('DeleteProject error:', error)
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

    try {
        const projects = await prisma.project.findMany({
          where: { userId: id },
          orderBy: { createdAt: 'desc' },
        });

        return res.status(200).json({
        message:"fetched successfully!",
        projects
        })
    } catch (error) {
        console.error('getProject error:', error)
        return res.status(500).json({message:"Internal Server Error"})
    }
}
