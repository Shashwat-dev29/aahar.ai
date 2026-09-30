const{createClient}=require("redis");
const redisClient= createClient({
    url:process.env.REDIS_URL
});
redisClient.on('error',(err)=>console.error('[Redis Error]',err));
redisClient.on('connect',()=>console.log('[Redis] connected to cloud redis'));

(async()=>{
    try{
        await redisClient.connect();
    } catch(err){
        console.error("failed to connect to redis on startup",err);
    }
})();
module.exports=redisClient;