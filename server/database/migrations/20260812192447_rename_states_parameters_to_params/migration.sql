-- Ключ характеристик переименован: игровой сервер читает `params`, а не `parameters`
UPDATE "Character"
SET "states" = ("states" - 'parameters') || jsonb_build_object('params', "states" -> 'parameters')
WHERE "states" ? 'parameters';
