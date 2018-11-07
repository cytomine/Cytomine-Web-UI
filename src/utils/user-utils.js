export function fullName(user) {
    if(user == null) {
        return "";
    }
    return `${user.firstname} ${user.lastname} (${user.username})`;
}