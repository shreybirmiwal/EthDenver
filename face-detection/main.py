import face_recognition


image = face_recognition.load_image_file(r"https://blockworks.co/_next/image?url=https%3A%2F%2Fblockworks-co.imgix.net%2Fwp-content%2Fuploads%2F2023%2F06%2FSreeram-Kannan.jpg&w=384&q=75")
face_locations = face_recognition.face_locations(image)