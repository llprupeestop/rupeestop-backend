import sys
import json
from tabula import read_pdf
from PyPDF2 import PdfReader
import google.generativeai as genai

GEMINI_API_KEY = "YOUR_GEMINI_API_KEY"

def extract_table_from_pdf(pdf_path,passkey):
    try:
        # Get the total number of pages in the PDF
        with open(pdf_path, "rb") as file:
            reader = PdfReader(file)
            if reader.is_encrypted:
                reader.decrypt("DFLPS1544Q")

            total_pages = len(reader.pages)

        extracted_data = []

        for page_num in range(1, total_pages + 1):
            # Extract tables from each page
            tables = read_pdf(pdf_path, pages=page_num, password=passkey, multiple_tables=True)

            for table in tables:
                extracted_data.append({
                    "page": page_num,
                    "data": table.fillna("").to_dict(orient="records")
                })
        
        extract_gemini_data = send_to_gemini(json.dumps(extracted_data,indent=2, ensure_ascii=False))

        print(extract_gemini_data)
        sys.stdout.flush()

    except Exception as e:
        print(json.dumps({"Error": str(e)}))
        sys.stdout.flush()


# CONVERT IN JSON VIA GEMINI:

def send_to_gemini(data):
    genai.configure(api_key=GEMINI_API_KEY)
    generation_config = {
        "temperature": 0,
        "top_p": 0.95,
        "top_k": 40,
        "max_output_tokens": 8192,
        "response_mime_type": "application/json",  
    }
    model = genai.GenerativeModel("gemini-2.0-flash", generation_config=generation_config)

    prompt = f"""
        You are a financial expert below there is a extracted text data you have to convert it in to json structrured formate , i provide you refrece at bottom.
        Make each scheme with here data.

        Ensure:
        1**No extra text** before or after JSON.   
        2**Correct JSON syntax** with proper keys and values.
        3**Ensure numerical values remain as numbers** (no extra formatting).
        4**Ensure include summary section ** with all folios and toal value and with **grand total value.

        Transaction Details:
        ```json
            {data}
        ```json

        Return JSON only, without extra text. The format should be:

        Expected JSON format:
        {{
            "ICICI Prudential Manufacturing Fund Growth": {{

                "folio_no": "10076220",
                "kyc_status": "KYC OK",
                "nominee": "Registered",
                "isin": "INF109KC1LG4",
                "ucn": "Not Available",
                "mobile": "XXXXXX1600",
                "email": "kirti23@rediffmail.com",
                "opening_balance": 113.334,
                "transactions": [
                    {{
                    "date": "07.11.24",
                    "description": "Purchase-NSE - Instalment No - 5/906",
                    "amount": 999.95,
                    "stamp_duty": 0.05,
                    "nav": 34.56,
                    "price": 34.56,
                    "closing_balance": 142.268
                    }}
                ],
                "closing_balance": 142.268
            }}
        }}
        Return **ONLY** valid JSON.
    """

    response = model.generate_content(prompt)

    json_data = json.loads(response.text)  # Convert response to JSON

    print("::::::::::::::::::::::::opeai ai output::::::::::::::::::::::")
    print(json.dumps(json_data))
    print("::::::::::::::::::::::::opeai ai output::::::::::::::::::::::")
    return response.text

    

if __name__ == "__main__":
    pdf_path = sys.argv[1]
    extract_table_from_pdf(pdf_path,passkey)