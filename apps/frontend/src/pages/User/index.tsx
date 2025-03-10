import { ChangeEvent, useEffect, useState } from 'react';

import { IUser } from '@shared/types';
import { UserService } from '@/services/service.user';

const UserScreen = () => {
  const [newUserName, setNewUserName] = useState<string>('');
  const [users, setUsers] = useState<IUser[]>([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await UserService.getUsers();
      setUsers(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleAddUser = async () => {
    try {
      const res = await UserService.createUser(newUserName);
      setUsers((v) => [...v, res.data]);
      setNewUserName('');
    } catch (err) {
      console.log(err);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewUserName(e.target.value);
  };

  return (
    <div className="page-container">
      <input
        className="user-input"
        placeholder="New username"
        value={newUserName}
        onChange={handleInputChange}
      />
      <button
        className="btn-add"
        disabled={!newUserName}
        onClick={handleAddUser}
      >
        Add User
      </button>
      <div className="title">Current Users</div>
      <div className="table">
        <div className="row header">
          <div className="cell">Name</div>
          <div className="cell">Created At</div>
        </div>

        {users.map((user: IUser) => (
          <div className="row" key={user.username}>
            <div className="cell" data-title="Name">
              {user.username}
            </div>
            <div className="cell" data-title="Age">
              {new Date(user.created_at).toISOString().split('T')[0]}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserScreen;
