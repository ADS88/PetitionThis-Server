const db = require('../../config/db');
const bcrypt = require('bcrypt');

exports.registerUser = async function(name, email, password, city, country){
    const hashedPassword = await new Promise((resolve, reject) =>{
        bcrypt.hash(password, 1, function(err, hash){
            if(err) reject(err)
            resolve(hash)
        });
    })

    const query = 'insert into User (name, email, password, city, country) values (?, ?, ?, ?, ?)';
    const [rows] = await db.getPool().query(query, [name, email, hashedPassword, city, country]);
    const newUserId = rows.insertId;
    return newUserId;
};

exports.isLoginValid = async function(email, password){
    const query = 'SELECT password FROM User where email = ?';
    const [rows] = await db.getPool().query(query, [email]);
    if(rows.length > 0) {
        const hash = rows[0].password
        const match = await bcrypt.compare(password, hash);
        if(match) {
            return true
        } else {
            return false
        }
    }else{
        return false;
    }
};

exports.addTokenToUser = async function(email, token){
    const query = 'update User set auth_token = ? where email = ?';
    const [rows] = await db.getPool().query(query, [token, email]);
}

exports.getIdFromEmail = async function(email){
    const query = 'select user_id from User where email = ? ';
    const [rows] = await db.getPool().query(query, [email]);
    return rows[0].user_id
}

exports.isTokenInDatabse = async function (token) {
    const query = 'SELECT * from User Where auth_token = ?';
    const [rows] = await db.getPool().query(query, [token]);
    if(rows.length > 0){
        return true;
    }
    else{
        return false
    }
}

exports.isUserInDatabse = async function (id){
    const query = 'SELECT * from User Where user_id = ?';
    const [rows] = await db.getPool().query(query, [id]);
    if(rows.length > 0){
        return true;
    }
    else{
        return false
    }
};

exports.isEmailInDatabase = async function (email){
    const query = 'SELECT * from User Where email = ?';
    const [rows] = await db.getPool().query(query, [email]);
    if(rows.length > 0){
        return true;
    }
    else{
        return false
    }
};

exports.removeToken = async function(token){
    const query = 'UPDATE User set auth_token = null Where auth_token = ? ';
    await db.getPool().query(query, [token]);
};

exports.getIdFromToken = async function(token){
    const query = 'select user_id from User where auth_token = ? ';
    const [rows] = await db.getPool().query(query, [token]);
    return rows[0].user_id
};

exports.getUserById = async function(id, viewingOwnDetails){
    let query;
    if (viewingOwnDetails) {
         query = 'select name, city, country, email from User where user_id = ? ';
    }
    else{
         query = 'select name, city, country from User where user_id = ? ';
    }
    const [rows] = await db.getPool().query(query, [id]);
    return rows[0]
};

exports.getPasswordById = async function(id, viewingOwnDetails){
    let query;
    query = 'select password from User where user_id = ? ';
    const [rows] = await db.getPool().query(query, [id]);
    return rows[0].password
};

exports.editUser = async function(id, user){
    let query_values = []
    let query = 'UPDATE User SET '
    for (let [key, value] of Object.entries(user)){
        if(value != undefined){
            query += `${key} = ? , `
            query_values.push(value)
        }
    }
    let lastComma = query.lastIndexOf(',');
    query = query.substring(0, lastComma) + query.substring(lastComma + 1);
    query += 'WHERE user_id = ?'
    query_values.push(id)
    const [result] = await db.getPool().query(query, query_values);
    return result;
};


