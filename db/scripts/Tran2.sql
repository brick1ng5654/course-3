/*
Starts a transaction to read the record of 
Dominic Gonzalez and update his first name. 
Second SELECT shows the uncommitted update.
@@trancount showS the number of open transactions.
Then the transaction is rolled back and the record read again.
*/

USE AdventureWorks

BEGIN TRANSACTION
  SELECT @@trancount AS 'Transaction Count'
  SELECT FirstName, MiddleName, LastName FROM Person.Contact WHERE ContactID = 7454
  UPDATE Person.Contact SET FirstName = 'Dom' WHERE ContactID = 7454
  SELECT FirstName, MiddleName, LastName FROM Person.Contact WHERE ContactID = 7454
  SELECT @@trancount AS 'Transaction Count'
-- END TRANSACTION HERE
ROLLBACK TRANSACTION

  SELECT FirstName, MiddleName, LastName FROM Person.Contact WHERE ContactID = 7454
  SELECT @@trancount AS 'Transaction Count'
