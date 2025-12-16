/*
Read and update a record in the Person.Contact table in the AdventureWorks database.
*/

USE AdventureWorks

SET TRANSACTION ISOLATION LEVEL SERIALIZABLE

BEGIN TRANSACTION
  -- WAITFOR DELAY '00:05:00'
  SELECT * FROM Person.Contact WHERE ContactID = 10
  UPDATE Person.Contact SET FirstName = 'Frances' WHERE ContactID = 6
-- For the purpose of the exercise, COMMIT TRANSACTION or ROLLBACK TRANSACTION are not used.

SELECT @@spid AS 'SPID'
-- Use the SPID to identify the connection when using sp_lock.

-- ROLLBACK TRANSACTION