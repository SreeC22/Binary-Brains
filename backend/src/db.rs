use mongodb::{options::ClientOptions, Client, Database};

pub async fn establish_connection() -> mongodb::error::Result<Database> {
    //mongo db uri
    let mongodb_uri = "mongodb+srv://sc354:cs490mdb@cluster01.ik8tfsj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster01";

    //parsing connection string
    let client_options = ClientOptions::parse(mongodb_uri).await?;
    
    //client setup
    let client = Client::with_options(client_options)?;

    //db to work with 
    let db = client.database("Cluster01");

    Ok(db)
}
