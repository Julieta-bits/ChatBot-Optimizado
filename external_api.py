import requests

def buscar_en_openstax(query):
    """
    Busca contenido académico en la API de OpenStax.
    """
    # Buscamos específicamente en libros de ciencias/matemáticas
    url = f"https://openstax.org/api/v2/pages/?search={query}&type=book.Chapter"
    
    try:
        response = requests.get(url, timeout=3)
        if response.status_code == 200:
            data = response.json()
            if data['items']:
                # Retornamos la descripción y el título del capítulo más relevante
                resultado = data['items'][0]
                titulo = resultado['title']
                contenido = resultado['search_description']
                return f"Información de OpenStax ({titulo}): {contenido}"
        return "No se encontró información específica en los libros de texto."
    except Exception:
        return "Error de conexión con la biblioteca externa."