
USE AdventureWorks
GO

-- Create Sales.GetCurrencyRate


-- Test Sales.GetCurrencyRate

-- Sales.GetCurrencyDiscountedProducts
CREATE FUNCTION Sales.GetCurrencyDiscountedProducts
	(@CurrencyCode nchar(3))
RETURNS @tbl_products TABLE
	(ProductID int, 
	Name nvarchar(50), 
	ListPrice money, 
	CurrencyPrice money,
	DiscountDescription nvarchar(255),
	DiscountPercentage smallmoney,
	DiscountAmount money,
	DiscountedPrice money,
	DiscountedCurrencyPrice money)
AS
BEGIN
	DECLARE @CurrencyRate float
	SET @CurrencyRate = Sales.GetCurrencyRate(@CurrencyCode)

	INSERT	@tbl_products
	SELECT	P.ProductID, 
			P.Name, 
			P.ListPrice,
			P.ListPrice * @CurrencyRate, 
			SO.Description, 
			SO.DiscountPct, 
			P.ListPrice * SO.DiscountPct, 
			P.ListPrice - P.ListPrice * SO.DiscountPct,
			(P.ListPrice - P.ListPrice * SO.DiscountPct) * @CurrencyRate
	FROM	Sales.SpecialOfferProduct SOP INNER JOIN
			Sales.SpecialOffer SO ON SOP.SpecialOfferID = SO.SpecialOfferID INNER JOIN
			Production.Product P ON SOP.ProductID = P.ProductID
	WHERE	(SO.DiscountPct > 0) AND GetDate() BETWEEN StartDate AND EndDate
	ORDER BY ProductID
	RETURN
END
GO

-- Test Sales.GetCurrencyDiscountedProducts
