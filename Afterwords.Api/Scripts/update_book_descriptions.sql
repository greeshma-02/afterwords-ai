-- Add description column if it does not exist
ALTER TABLE books ADD COLUMN IF NOT EXISTS description TEXT;

-- Update descriptions by title
UPDATE books SET description =
'A moving story about a grumpy but lovable man whose quiet acts of kindness transform the lives of those around him.'
WHERE title = 'A Man Called Ove';

UPDATE books SET description =
'A warm and whimsical fantasy about a caseworker sent to inspect a magical orphanage, where he discovers found family and acceptance.'
WHERE title = 'The House in the Cerulean Sea';

UPDATE books SET description =
'A beloved classic about an imaginative orphan girl whose curiosity and optimism transform a quiet town.'
WHERE title = 'Anne of Green Gables';

UPDATE books SET description =
'A poetic fable about a young prince traveling across planets, discovering love, loneliness, and the meaning of life.'
WHERE title = 'The Little Prince';

UPDATE books SET description =
'A quiet, philosophical story about a tea monk and a curious robot exploring purpose, rest, and what it means to live well.'
WHERE title = 'A Psalm for the Wild-Built';

UPDATE books SET description =
'A collection of comforting reflections about resilience, hope, and finding light during difficult times.'
WHERE title = 'The Comfort Book';

UPDATE books SET description =
'A thought-provoking novel about regret, parallel lives, and discovering that life is worth living.'
WHERE title = 'The Midnight Library';

UPDATE books SET description =
'A timeless tale about following dreams and listening to the quiet guidance of the universe.'
WHERE title = 'The Alchemist';

UPDATE books SET description =
'A powerful memoir exploring how meaning and purpose help humans endure suffering.'
WHERE title = 'Man''s Search for Meaning';

UPDATE books SET description =
'A collection of heartfelt advice essays about love, grief, and the messy beauty of human life.'
WHERE title = 'Tiny Beautiful Things';

UPDATE books SET description =
'A deeply personal reflection on depression, survival, and the quiet strength required to keep going.'
WHERE title = 'Reasons to Stay Alive';

UPDATE books SET description =
'A clever and compassionate novel about strangers connected through a chaotic bank robbery.'
WHERE title = 'Anxious People';

UPDATE books SET description =
'A touching story of loneliness, kindness, and the unexpected ways people change each other.'
WHERE title = 'Eleanor Oliphant Is Completely Fine';

UPDATE books SET description =
'A charming novel about a lonely bookstore owner whose life changes through books and community.'
WHERE title = 'The Storied Life of A.J. Fikry';

UPDATE books SET description =
'A magical story set in a café where customers can travel through time, if they follow a few strict rules.'
WHERE title = 'Before the Coffee Gets Cold';

UPDATE books SET description =
'A tender romance about childhood friends who reconnect years later and confront their shared past.'
WHERE title = 'Love & Other Words';

UPDATE books SET description =
'A witty story about rival writers who challenge each other while navigating grief and creativity.'
WHERE title = 'Beach Read';

UPDATE books SET description =
'A humorous romantic story about a socially awkward professor who approaches love scientifically.'
WHERE title = 'The Rosie Project';

UPDATE books SET description =
'A sweet and nostalgic romance built around late-night email conversations in a newsroom.'
WHERE title = 'Attachments';

UPDATE books SET description =
'A classic love story exploring class, pride, misunderstanding, and emotional growth.'
WHERE title = 'Pride and Prejudice';

UPDATE books SET description =
'A quirky and thoughtful novel about a woman who finds quiet comfort in her unconventional life.'
WHERE title = 'Convenience Store Woman';

UPDATE books SET description =
'A cozy novel about rediscovering purpose while working in a small Tokyo bookshop.'
WHERE title = 'Days at the Morisaki Bookshop';

UPDATE books SET description =
'A touching story about friendship and healing built around a small Japanese sweet shop.'
WHERE title = 'Sweet Bean Paste';

UPDATE books SET description =
'A delicate and introspective novel about grief, food, and finding comfort in ordinary life.'
WHERE title = 'Kitchen';

UPDATE books SET description =
'A heartwarming story about a mysterious librarian who helps people rediscover direction in life.'
WHERE title = 'What You Are Looking For Is in the Library';

UPDATE books SET description =
'A magical coming-of-age adventure about friendship, courage, and discovering your place in the world.'
WHERE title = 'Harry Potter and the Philosopher''s Stone';

UPDATE books SET description =
'A classic fantasy adventure following a reluctant hero on a journey through danger and wonder.'
WHERE title = 'The Hobbit';

UPDATE books SET description =
'A beloved story about a brilliant girl who learns to stand up to injustice.'
WHERE title = 'Matilda';

UPDATE books SET description =
'A moving story about kindness, empathy, and a boy learning to face the world with courage.'
WHERE title = 'Wonder';

UPDATE books SET description =
'A classic story about healing and friendship found in a hidden garden.'
WHERE title = 'The Secret Garden';

UPDATE books SET description =
'A witty and absurd fantasy comedy about angels, demons, and the apocalypse.'
WHERE title = 'Good Omens';

UPDATE books SET description =
'A humorous memoir filled with sharp observations about life and language.'
WHERE title = 'Me Talk Pretty One Day';

UPDATE books SET description =
'A witty memoir about comedy, career, and learning to laugh at life.'
WHERE title = 'Bossypants';

UPDATE books SET description =
'A hilarious illustrated memoir about anxiety, awkwardness, and everyday absurdity.'
WHERE title = 'Hyperbole and a Half';

UPDATE books SET description =
'A funny and honest memoir about creativity, ambition, and imperfect life choices.'
WHERE title = 'Yes Please';

UPDATE books SET description =
'A powerful story set during WWII about loss, courage, and the beauty of words.'
WHERE title = 'The Book Thief';

UPDATE books SET description =
'A melancholic love story about youth, longing, and emotional distance.'
WHERE title = 'Norwegian Wood';

UPDATE books SET description =
'A haunting story about memory, love, and the ethical boundaries of humanity.'
WHERE title = 'Never Let Me Go';

UPDATE books SET description =
'A modern love story about two people navigating intimacy, class, and identity.'
WHERE title = 'Normal People';

UPDATE books SET description =
'A devastating and deeply emotional story about friendship, trauma, and survival.'
WHERE title = 'A Little Life';

UPDATE books SET description =
'A cozy fantasy about an orc opening a café and discovering the meaning of community.'
WHERE title = 'Legends & Lattes';

UPDATE books SET description =
'A gentle and imaginative story about friendship between a woman and an unusually intelligent octopus.'
WHERE title = 'Remarkably Bright Creatures';

UPDATE books SET description =
'A cozy fantasy about a secret magical society and the power of belonging.'
WHERE title = 'The Very Secret Society of Irregular Witches';

UPDATE books SET description =
'A romantic comedy about rival literary agents discovering love through books.'
WHERE title = 'Book Lovers';

UPDATE books SET description =
'A heartwarming story about a small library reading group that changes lives.'
WHERE title = 'The Reading List';

UPDATE books SET description =
'A reflective novel exploring faith, family, and the quiet beauty of ordinary life.'
WHERE title = 'Gilead';

UPDATE books SET description =
'A quiet, introspective novel about an ordinary man and the dignity of a simple life.'
WHERE title = 'Stoner';

UPDATE books SET description =
'A reflective story about memory, regret, and a butler looking back on his life.'
WHERE title = 'The Remains of the Day';

UPDATE books SET description =
'A powerful classic about justice, childhood innocence, and moral courage.'
WHERE title = 'To Kill a Mockingbird';

UPDATE books SET description =
'A timeless children''s story about friendship between a pig and a clever spider.'
WHERE title = 'Charlotte''s Web';
