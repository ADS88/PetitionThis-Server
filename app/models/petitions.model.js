const db = require('../../config/db');
exports.getAllPetitions = async function(queryString, categoryId, authorId, sortBy){
    let fillers = []
    let query = `SELECT p.petition_id as petitionId, title, c.name as category, u.name as authorName, count(*) as signatureCount 
                FROM Petition p
                Join Category c on c.category_id = p.category_id
                Join User u on p.author_id = u.user_id
                Join Signature s on s.petition_id = p.petition_id
                Where true `

    if(queryString !== undefined){
        query += `and title like ?`
        fillers.push("%" + queryString + "%")
    }

    if(categoryId !== undefined){
        query+= 'and c.category_id = ? '
        fillers.push(categoryId)
    }

    if(authorId !== undefined){
        query+= 'and p.author_id = ? '
        fillers.push(authorId)
    }


    query +=    'group by p.petition_id '
    query += sortBy

    const [rows] = await db.getPool().query(query, fillers);
    return rows;
};

exports.getOnePetition = async function(id){
    const query = `select p.petition_id as petitionId, title, c.name category, u.name as authorName, count(*) as signatureCount, description, 
                    u.user_id as authorId, u.city as authorCity, u.country as authorCountry, created_date as createdDate, closing_date as closingDate
                    from Petition p
                    Join User u on u.user_id = p.author_id
                    Join Category c on c.category_id = p.category_id
                    Join Signature s on s.petition_id = p.petition_id
                    where p.petition_id = ?
                    group by s.petition_id;`;
    const [rows] = await db.getPool().query(query, [id]);
    return rows[0];
};
exports.createPetition = async function(title, description, categoryId, closingDate, authorId){
    var currentDate = new Date();
    const query = 'INSERT INTO Petition (created_date, author_id, title, description, category_id, closing_date) VALUES (?, ?, ?, ?, ?, ?)';
    const [result] = await db.getPool().query(query, [currentDate, authorId, title, description, categoryId, closingDate]);
    return result.insertId;
};

exports.deletePetition = async function(id){
    const query = 'DELETE from Petition WHERE petition_id = ?';
    await db.getPool().query(query, [id]);
};

exports.editPetition = async function(id, data){
    let query_values = []
    let query = 'UPDATE Petition SET '
    for (let [key, value] of Object.entries(data)){
        if(value != undefined){
            query += `${key} = ? , `
            query_values.push(value)
        }
    }
    let lastComma = query.lastIndexOf(',');
    query = query.substring(0, lastComma) + query.substring(lastComma + 1);
    query += 'WHERE petition_id = ?'
    query_values.push(id)
    const [result] = await db.getPool().query(query, query_values);
    return result;
};

exports.getAllPetitionCategories = async function(){
    const query = 'SELECT category_id as categoryId, name FROM Category';
    const [result] = await db.getPool().query(query);
    return result;
}

exports.doesCategoryExist = async function(id){
    const query = 'SELECT * From Category Where category_id = ?';
    const [rows] = await db.getPool().query(query, [id]);
    return rows.length > 0
}

exports.doesPetitionExist = async function(id){
    const query = 'SELECT * From Petition Where petition_id = ?';
    const [rows] = await db.getPool().query(query, id);
    return rows.length > 0
}

exports.getPetitionAuthor = async function(petitionId){
    const query = 'SELECT author_id from Petition Where petition_id = ?';
    const [rows] = await db.getPool().query(query, petitionId);
    return rows[0].author_id
}

exports.getPetitionClosingDate = async function(petitionId){
    const query = 'SELECT closing_date from Petition Where petition_id = ?';
    const [rows] = await db.getPool().query(query, petitionId);
    return rows[0].closing_date
}

