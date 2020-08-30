const bcrypt = require('bcrypt');
exports.hash = async function(password){
    const hashedPassword = await new Promise((resolve, reject) =>{
        bcrypt.hash(password, 1, function(err, hash){
            if(err) reject(err)
            resolve(hash)
        });
    })
    return hashedPassword
}