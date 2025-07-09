//TURNERO\Backend\src\services\dto\users.dto.js
export default class UsersDTO {
    constructor(user) {
        this.id = user._id;
        this.name = `${user.first_name} ${user.last_name}`;
        this.email = user.email;
        this.age = user.age;
        this.phone = user.phone;
        this.role = user.role;
        this.isAdmin = user.role === 'admin';
    }
}