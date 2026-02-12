// Base de datos simulada
const DB_RECIPES = [
    {id: 1, title: "tacos al pastor", category: "Mexicana", difficulty: "media", time: "60 min", image: "https://images.unsplash.com/photo-1599974579688-8dbdd335c77f"},
    {id: 2, title: "rollo de sushi nevado", category: "Japonesa", difficulty: "alta", time: "45 min", image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c"},
    {id: 3, title: "pizza margarita", category: "Italiana", difficulty: "baja", time: "30 min", image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002"},
    {id: 4, title: "ensalada cesar", category: "Saludable", difficulty: "baja", time: "15 min", image: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9"},
    {id: 5, title: "mole poblano", category: "Mexicana", difficulty: "alta", time: "180 min", image: "https://images.unsplash.com/photo-1593006437637-2996d9df2493"}
]

/**simulacion de llamada a API rest para get
*@param {string} query - sera utilizado para buscar texto
*@param {string} filter - filtro de categorias
*@returns {Promise} - promesa que resuelve el json
*/

export const searchRecipesAPI = (query, filter) => {
    return new Promise((resolver) => {

        //log para depurar
        console.log("api simulda recibiendo peticion:");
        console.log(" - busqueda texto", query);
        console.log(" - filtro categoria", filter);

        //simulacion de latencia
        const latency = Math.floor(Math.random() * 1000) + 500;

        setTimeout(() => {
            let results = DB_RECIPES;

            //filtrado por texto
            if (query) {
                const lowerQuery = query.toLowerCase();
                results = results.filter(item =>
                    item.title.toLowerCase().includes(lowerQuery) ||
                    item.category.toLowerCase().includes(lowerQuery)
                );
            }
            //filtrado por categorias
            if ( filter && filter !== 'Todas') {
                results = results.filter(item => item.category === filter);
            }

            console.log(" resultados encontrados:", results.length);

            //respuesta simulada
            resolver({
                status:200,
                message:"Busqueda exitosa",
                data: results,
                meta: {
                    total: results.length,
                    timestamp: new Date().toISOString()
                }
            });
        }, latency);
    });
};