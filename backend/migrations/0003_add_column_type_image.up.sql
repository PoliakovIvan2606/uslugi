ALTER TABLE generate_image
ADD COLUMN type TEXT CHECK (type IN ('service', 'task'));
