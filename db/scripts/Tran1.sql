/*
Starts a transaction to read the record of 
Linda Gonzales and update her first name. 
Second select shows the uncommitted update. 
@@trancount shows the number of open transactions.
*/

USE AdventureWorks

-- START TRANSACTION HERE
BEGIN TRANSACTION
  SELECT @@trancount AS 'Transaction Count'
  SELECT FirstName, MiddleName, LastName FROM Person.Contact WHERE ContactID = 342
  UPDATE Person.Contact SET FirstName = 'Lin' WHERE ContactID = 342
-- END TRANSACTION HERE
COMMIT TRANSACTION

SELECT FirstName, MiddleName, LastName FROM Person.Contact WHERE ContactID = 342
SELECT @@trancount AS 'Transaction Count'

