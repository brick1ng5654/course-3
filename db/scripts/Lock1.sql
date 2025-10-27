/*
Update a record in the Person.Contact table in the AdventureWorks database.
*/

USE AdventureWorks

BEGIN TRANSACTION
  UPDATE Person.Contact
    SET FirstName = 'Fran'
    WHERE ContactID = 6
-- For the purpose of the exercise, COMMIT TRANASACTION or ROLLBACK TRANSACTION are not used.

SELECT @@spid AS 'spid'
-- Use the SPID to identify the connection when using sys.dm_tran_locks.

ROLLBACK TRANSACTION