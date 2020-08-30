const db = require('../../config/db');

exports.doesPhotoExist = async function(id){
    let query = `SELECT * FROM User WHERE user_id = ? AND photo_filename is not null`
    const [rows] = await db.getPool().query(query, [id]);
    if(rows.length > 0){
        return true;
    }
    else{
        return false
    }
};

exports.getPhoto = async function(id){
    let query = `SELECT photo_filename FROM User WHERE user_id = ?`
    const [rows] = await db.getPool().query(query, [id]);
    return rows[0].photo_filename
};

exports.deletePhoto = async function(id){
    let query = `Update  User set photo_filename = NULL  WHERE user_id = ?`
    const [rows] = await db.getPool().query(query, [id]);
};

exports.addPhotoToUser = async function(userId, photoName){
    let status = 200
    let query1 = 'SELECT photo_filename from User Where user_id = ?';
    const [result1] = await db.getPool().query(query1, [userId]);
    if(result1[0].photo_filename === null){
        status = 201;
    }

    let query = `Update User Set photo_filename = ? WHERE user_id = ?`
    await db.getPool().query(query, [photoName, userId]);
    return status
};



