class ApiFeatures{
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr=queryStr
  }

  ///FILTERING
  filter() {
 const queryObj = { ...this.queryStr };
    const excludeQuery = ['limit','page','sort','field'];
    excludeQuery.forEach((el) => delete queryObj[el]);
////filtering
    let QueryStr = JSON.stringify({ ...queryObj });
    QueryStr = QueryStr.replace(
      /\b(gte| gt|lte|lt)\b/g,
      (match) => `$${match}`,
    );
    QueryStr = JSON.parse(QueryStr)
    this.query = this.query.find(QueryStr)
    
    return this
  }

  sort() {
  let sortBy='createdAt'
    if (this.queryStr.sort) {
      const sortField= this.queryStr.sort.split(',').map(field=> field.trim() )
      if (sortField.length > 0) {
      sortBy=sortField.join(' ')
      }
      
      this.query = this.query.sort(sortBy)
    }
    
  return this
  }


  limitField() {
   let field ='-__v'
     if (this.queryStr.field) {
       const limitField = this.queryStr.field.split(',').map((field) => field.trim());
       if (limitField.length > 0) {
       field = limitField.join(' ');
       }
     }
    this.query=this.query.select(field)
  
  return this
  }


  pagination() {
   const page=Number(this.queryStr.page) || 100
    const limit = Number(this.queryStr.limit)
    const skip = (page - 1) * limit
 
   this.query=  this.query.skip(skip).limit(limit)
   
  return this
  }
}

module.exports=ApiFeatures