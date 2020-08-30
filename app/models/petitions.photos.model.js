const db = require('../../config/db');

exports.doesPhotoExist = async function(id){
    let query = `SELECT * FROM Petition WHERE petition_id = ? AND photo_filename is not null`
    const [rows] = await db.getPool().query(query, [id]);
    if(rows.length > 0){
        return true;
    }
    else{
        return false
    }
};

exports.getPhoto = async function(id){
    let query = `SELECT photo_filename FROM Petition WHERE petition_id = ?`
    const [rows] = await db.getPool().query(query, [id]);
    return rows[0].photo_filename
};

exports.addPhotoToPetition = async function(petitionId, photoName){
    let status = 200
    let query1 = 'SELECT photo_filename from Petition Where petition_id = ?';
    const [result1] = await db.getPool().query(query1, [petitionId]);
    if(result1[0].photo_filename === null){
        status = 201;
    }

    let query = `Update Petition Set photo_filename = ? WHERE petition_id = ?`
    const [rows] = await db.getPool().query(query, [photoName, petitionId]);
    return status

};