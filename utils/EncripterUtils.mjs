import { genSalt, hash as _hash, compare } from 'bcrypt';

export default class EncripterUtils {
    async encryptPassword(password) {
        const salt = await genSalt(10);
        return _hash(password, salt);
    }
    async comparePassword(password, comparePassword) {
        return compare(password, comparePassword)
    }
}