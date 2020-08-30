const db = require('../../config/db');
exports.getSignaturesFromPetition = async function(id){
    const query = `SELECT signatory_id as signatoryId, name, city, country, signed_date as signedDate
                   FROM Signature s
                   Join Petition p on s.petition_id = p.petition_id
                   Join User u on u.user_id = s.signatory_id
                   WHERE p.petition_id = ?
                   order by signedDate ASC`;
    const [rows] = await db.getPool().query(query, [id]);
    return rows;
};

exports.hasSignedPetition = async function(userId, petitionId){
    const query = `SELECT * FROM Signature Where signatory_id = ? and petition_id = ?`;
    const [rows] = await db.getPool().query(query, [userId, petitionId]);
    return rows.length > 0;
};

exports.signPetition = async function(userId, petitionId){
    const query = "INSERT INTO Signature(signatory_id, petition_id, signed_date) VALUES (?, ?, ?)"
    await db.getPool().query(query, [userId, petitionId, new Date()]);
};

exports.deleteSignature = async function(userId, petitionId){
    const query = "Delete FROM Signature where signatory_id = ? and petition_id = ?"
    await db.getPool().query(query, [userId, petitionId]);
};


exports.getPetitionClosingDate = async function(petitionId){
    const query = "Select closing_date from Petition where petition_id = ?"
    const [rows] = await db.getPool().query(query, [petitionId]);
    return rows[0].closing_date
};

exports.doesPetitionExist = async function(petitionId){
    const query = "Select * from Petition where petition_id = ?"
    const [rows] = await db.getPool().query(query, [petitionId]);
    return rows.length > 0;
};
