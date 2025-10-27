-- This should fail
USE AdventureWorks
TRUNCATE TABLE [HumanResources].[JobCandidateHistory]
GO
USE AdventureWorks
INSERT INTO [HumanResources].[JobCandidateHistory]
VALUES
(1,
'<ns:Resume xmlns:ns="http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/Resume">
  <ns:ResumeData></ns:ResumeData>
</ns:Resume>'
,-1
,GETDATE()
,1)
TRUNCATE TABLE [HumanResources].[JobCandidateHistory]
GO

-- This should succeed
USE AdventureWorks
INSERT INTO [HumanResources].[JobCandidateHistory]
VALUES
(1,
'<ns:Resume xmlns:ns="http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/Resume">
  <ns:ResumeData></ns:ResumeData>
</ns:Resume>'
,6
,GETDATE()
,1)
TRUNCATE TABLE [HumanResources].[JobCandidateHistory]
GO