# from google.cloud import documentai
# import os


# os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "../vision_key.json" #replace with your key.


# def process_document_sample(project_id, location, processor_id, file_path, mime_type):
#     client = documentai.DocumentProcessorServiceClient()
#     name = f"projects/{project_id}/locations/{location}/processors/{processor_id}"

#     with open(file_path, "rb") as image:
#         image_content = image.read()

#     raw_document = documentai.RawDocument(content=image_content, mime_type=mime_type)
#     request = documentai.ProcessRequest(name=name, raw_document=raw_document)
#     result = client.process_document(request=request)
#     document = result.document

#     extracted_data = {}
#     for entity in document.entities:
#         label = entity.type_
#         text = entity.normalized_value.text if entity.normalized_value else entity.mention_text
#         extracted_data[label] = text

#     print(extracted_data)






# process_document_sample(
#   project_id="cheque-data-extractor",
#   location="us",
#   processor_id="5541de561ce7840d",
#   file_path="/checkbaig.jpeg",
#   mime_type="image/jpeg",
# )