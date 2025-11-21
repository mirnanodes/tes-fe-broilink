# Owner Request Seeder untuk Laravel

Simpan file ini sebagai `database/seeders/OwnerRequestSeeder.php` di project Laravel backend.

```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Request as RequestModel;
use App\Models\User;
use Carbon\Carbon;

class OwnerRequestSeeder extends Seeder
{
    public function run()
    {
        // Get owner users
        $owners = User::whereHas('role', function($q) {
            $q->where('name', 'Owner');
        })->get();

        if ($owners->isEmpty()) {
            $this->command->warn('No owners found. Please seed users first.');
            return;
        }

        $requests = [
            // Tambah Kandang requests
            [
                'user_id' => $owners->first()->id,
                'request_type' => 'Tambah Kandang',
                'request_content' => json_encode([
                    'farm_name' => 'Kandang D - Semarang',
                    'location' => 'Semarang, Jawa Tengah',
                    'farm_area' => '500'
                ]),
                'status' => 'menunggu',
                'created_at' => Carbon::now()->subDays(1),
                'updated_at' => Carbon::now()->subDays(1),
            ],
            [
                'user_id' => $owners->first()->id,
                'request_type' => 'Tambah Kandang',
                'request_content' => json_encode([
                    'farm_name' => 'Kandang E - Purwokerto',
                    'location' => 'Purwokerto, Jawa Tengah',
                    'farm_area' => '750'
                ]),
                'status' => 'diproses',
                'created_at' => Carbon::now()->subDays(3),
                'updated_at' => Carbon::now()->subDays(2),
            ],
            [
                'user_id' => $owners->count() > 1 ? $owners->get(1)->id : $owners->first()->id,
                'request_type' => 'Tambah Kandang',
                'request_content' => json_encode([
                    'farm_name' => 'Kandang F - Kudus',
                    'location' => 'Kudus, Jawa Tengah',
                    'farm_area' => '600'
                ]),
                'status' => 'selesai',
                'created_at' => Carbon::now()->subDays(7),
                'updated_at' => Carbon::now()->subDays(5),
            ],

            // Tambah Peternak requests
            [
                'user_id' => $owners->first()->id,
                'request_type' => 'Tambah Peternak',
                'request_content' => json_encode([
                    'name' => 'Rudi Hermawan',
                    'phone_number' => '+62821-5555-6666',
                    'email' => 'rudi.hermawan@example.com'
                ]),
                'status' => 'menunggu',
                'created_at' => Carbon::now()->subHours(12),
                'updated_at' => Carbon::now()->subHours(12),
            ],
            [
                'user_id' => $owners->first()->id,
                'request_type' => 'Tambah Peternak',
                'request_content' => json_encode([
                    'name' => 'Andi Prasetyo',
                    'phone_number' => '+62822-7777-8888',
                    'email' => 'andi.prasetyo@example.com'
                ]),
                'status' => 'diproses',
                'created_at' => Carbon::now()->subDays(2),
                'updated_at' => Carbon::now()->subDays(1),
            ],
            [
                'user_id' => $owners->count() > 1 ? $owners->get(1)->id : $owners->first()->id,
                'request_type' => 'Tambah Peternak',
                'request_content' => json_encode([
                    'name' => 'Sri Wahyuni',
                    'phone_number' => '+62823-9999-0000',
                    'email' => 'sri.wahyuni@example.com'
                ]),
                'status' => 'selesai',
                'created_at' => Carbon::now()->subDays(5),
                'updated_at' => Carbon::now()->subDays(4),
            ],

            // Guest requests (cuma nama + nomor, tanpa email)
            [
                'user_id' => null, // Guest tidak punya user_id
                'guest_name' => 'Bambang Sutrisno',
                'guest_phone' => '+62824-1111-2222',
                'request_type' => 'Masalah Login',
                'request_content' => 'Tidak bisa login ke aplikasi',
                'status' => 'menunggu',
                'created_at' => Carbon::now()->subHours(6),
                'updated_at' => Carbon::now()->subHours(6),
            ],
            [
                'user_id' => null,
                'guest_name' => 'Siti Rahayu',
                'guest_phone' => '+62825-3333-4444',
                'request_type' => 'Reset Password',
                'request_content' => 'Lupa password akun',
                'status' => 'diproses',
                'created_at' => Carbon::now()->subDays(1),
                'updated_at' => Carbon::now()->subHours(18),
            ],
            [
                'user_id' => null,
                'guest_name' => 'Ahmad Yusuf',
                'guest_phone' => '+62826-5555-6666',
                'request_type' => 'Pertanyaan Umum',
                'request_content' => 'Bagaimana cara mendaftar sebagai owner?',
                'status' => 'selesai',
                'created_at' => Carbon::now()->subDays(4),
                'updated_at' => Carbon::now()->subDays(3),
            ],
        ];

        foreach ($requests as $request) {
            RequestModel::create($request);
        }

        $this->command->info('Owner request seeder completed!');
        $this->command->info('Created 9 requests: 3 Tambah Kandang, 3 Tambah Peternak, 3 Guest');
    }
}
```

## Cara Pakai:

1. Copy code di atas ke file `database/seeders/OwnerRequestSeeder.php`
2. Register di `database/seeders/DatabaseSeeder.php`:
```php
public function run()
{
    $this->call([
        // ... seeder lain
        OwnerRequestSeeder::class,
    ]);
}
```
3. Jalankan: `php artisan db:seed --class=OwnerRequestSeeder`

## Catatan:
- **Owner requests**: Ada 2 tipe - "Tambah Kandang" (dengan farm_name, location, farm_area) dan "Tambah Peternak" (dengan name, phone_number, email)
- **Guest requests**: Hanya nama lengkap + nomor WhatsApp (tanpa email, tanpa notes kompleks)
- Status: menunggu, diproses, selesai
