<!-- src/views/UsersView.vue -->
<template>
  <section>
    <h2 class="page-title">Users</h2>

    <div class="card">
      <table class="table">
        <thead>
          <tr>
            <th>#</th>
            <th>User name</th>
            <th>Email</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>{{ user.id }}</td>
            <td>{{ user.name }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.role }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup lang="ts">
  interface User {
    id: number
    name: string
    email: string
    role: string
  }

  const users: User[] = [
    { id: 1, name: 'Aye Chan', email: 'aye@example.com', role: 'Admin' },
    { id: 2, name: 'Min Thu', email: 'min@example.com', role: 'Editor' },
    { id: 3, name: 'Su Su', email: 'su@example.com', role: 'Viewer' },
  ]
</script>

<style scoped>
  .table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
  }

  th,
  td {
    padding: 0.5rem 0.75rem;
    border-bottom: 1px solid #e5e7eb;
    text-align: left;
  }

  thead th {
    background-color: #f3f4f6;
    font-weight: 600;
  }
</style>
