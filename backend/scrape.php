<?php
set_time_limit(600);
require_once 'config/db.php';

$env = parse_ini_file('.env');
$api_key = $env['API_KEY'];
$season = 2024;

$headers = ['x-apisports-key: ' . $api_key];

// IDs das 19 equipas da Primeira Liga 2024
$teams = [
    231, 240, 242,
    762, 810, 4716, 15130, 21595
];

$inserted = 0;

foreach ($teams as $team_id) {
    
    $page = 1;
    
    do {
        $url = "https://v3.football.api-sports.io/players?team={$team_id}&season={$season}&page={$page}";
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        $response = curl_exec($ch);
        curl_close($ch);
        
        $data = json_decode($response, true);
        
        $total_pages = $data['paging']['total'];
        
        if (empty($data['response'])) break;
        
        foreach ($data['response'] as $item) {
            $p = $item['player'];
            $s = $item['statistics'][0] ?? [];
            $games = $s['games'] ?? [];
            
            $appearences = $games['appearences'] ?? null;
            if ($appearences === null || $appearences < 10) {
                $difficulty = 'hard';
            } elseif ($appearences < 20) {
                $difficulty = 'medium';
            } else {
                $difficulty = 'easy';
            }
            
            $stmt = $pdo->prepare("
                INSERT INTO players (
                    id, name, firstname, lastname, age,
                    birth_date, birth_place, birth_country,
                    nationality, height, weight, injured, photo,
                    team_id, team_name, team_logo, season,
                    position, appearences, lineups, minutes, rating, captain,
                    substitutes_in, substitutes_out, bench,
                    shots_total, shots_on,
                    goals_total, goals_conceded, goals_assists, goals_saves,
                    passes_total, passes_key, passes_accuracy,
                    tackles_total, tackles_blocks, tackles_interceptions,
                    duels_total, duels_won,
                    dribbles_attempts, dribbles_success, dribbles_past,
                    fouls_drawn, fouls_committed,
                    cards_yellow, cards_yellowred, cards_red,
                    penalty_scored, penalty_missed,
                    difficulty
                ) VALUES (
                    :id, :name, :firstname, :lastname, :age,
                    :birth_date, :birth_place, :birth_country,
                    :nationality, :height, :weight, :injured, :photo,
                    :team_id, :team_name, :team_logo, :season,
                    :position, :appearences, :lineups, :minutes, :rating, :captain,
                    :substitutes_in, :substitutes_out, :bench,
                    :shots_total, :shots_on,
                    :goals_total, :goals_conceded, :goals_assists, :goals_saves,
                    :passes_total, :passes_key, :passes_accuracy,
                    :tackles_total, :tackles_blocks, :tackles_interceptions,
                    :duels_total, :duels_won,
                    :dribbles_attempts, :dribbles_success, :dribbles_past,
                    :fouls_drawn, :fouls_committed,
                    :cards_yellow, :cards_yellowred, :cards_red,
                    :penalty_scored, :penalty_missed,
                    :difficulty
                ) ON DUPLICATE KEY UPDATE name = VALUES(name)
            ");
            
            $stmt->execute([
                ':id'                    => $p['id'],
                ':name'                  => $p['name'],
                ':firstname'             => $p['firstname'],
                ':lastname'              => $p['lastname'],
                ':age'                   => $p['age'],
                ':birth_date'            => $p['birth']['date'] ?? null,
                ':birth_place'           => $p['birth']['place'] ?? null,
                ':birth_country'         => $p['birth']['country'] ?? null,
                ':nationality'           => $p['nationality'],
                ':height'                => $p['height'],
                ':weight'                => $p['weight'],
                ':injured'               => $p['injured'] ? 1 : 0,
                ':photo'                 => $p['photo'],
                ':team_id'               => $s['team']['id'] ?? null,
                ':team_name'             => $s['team']['name'] ?? null,
                ':team_logo'             => $s['team']['logo'] ?? null,
                ':season'                => $season,
                ':position'              => $games['position'] ?? null,
                ':appearences'           => $games['appearences'] ?? null,
                ':lineups'               => $games['lineups'] ?? null,
                ':minutes'               => $games['minutes'] ?? null,
                ':rating'                => $games['rating'] ?? null,
                ':captain'               => ($games['captain'] ?? false) ? 1 : 0,
                ':substitutes_in'        => $s['substitutes']['in'] ?? null,
                ':substitutes_out'       => $s['substitutes']['out'] ?? null,
                ':bench'                 => $s['substitutes']['bench'] ?? null,
                ':shots_total'           => $s['shots']['total'] ?? null,
                ':shots_on'              => $s['shots']['on'] ?? null,
                ':goals_total'           => $s['goals']['total'] ?? null,
                ':goals_conceded'        => $s['goals']['conceded'] ?? null,
                ':goals_assists'         => $s['goals']['assists'] ?? null,
                ':goals_saves'           => $s['goals']['saves'] ?? null,
                ':passes_total'          => $s['passes']['total'] ?? null,
                ':passes_key'            => $s['passes']['key'] ?? null,
                ':passes_accuracy'       => $s['passes']['accuracy'] ?? null,
                ':tackles_total'         => $s['tackles']['total'] ?? null,
                ':tackles_blocks'        => $s['tackles']['blocks'] ?? null,
                ':tackles_interceptions' => $s['tackles']['interceptions'] ?? null,
                ':duels_total'           => $s['duels']['total'] ?? null,
                ':duels_won'             => $s['duels']['won'] ?? null,
                ':dribbles_attempts'     => $s['dribbles']['attempts'] ?? null,
                ':dribbles_success'      => $s['dribbles']['success'] ?? null,
                ':dribbles_past'         => $s['dribbles']['past'] ?? null,
                ':fouls_drawn'           => $s['fouls']['drawn'] ?? null,
                ':fouls_committed'       => $s['fouls']['committed'] ?? null,
                ':cards_yellow'          => $s['cards']['yellow'] ?? null,
                ':cards_yellowred'       => $s['cards']['yellowred'] ?? null,
                ':cards_red'             => $s['cards']['red'] ?? null,
                ':penalty_scored'        => $s['penalty']['scored'] ?? null,
                ':penalty_missed'        => $s['penalty']['missed'] ?? null,
                ':difficulty'            => $difficulty
            ]);
            
            $inserted++;
        }
        
        echo "Equipa {$team_id} - Página {$page}/{$total_pages} processada<br>";
        flush();
        
        sleep(10);
        require_once 'config/db.php';
        $page++;
        
    } while ($page <= $total_pages);
}

echo "<br>Concluído! {$inserted} jogadores inseridos.";
?>