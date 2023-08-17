### DROP EVERYTHING ###
# Tables/views must be dropped in reverse order due to referential constraints (foreign keys).
DROP TABLE IF EXISTS Signature;
DROP TABLE IF EXISTS Petition;
DROP TABLE IF EXISTS User;
DROP TABLE IF EXISTS Category;