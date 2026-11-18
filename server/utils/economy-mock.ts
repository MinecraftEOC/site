import type { IEconomyAnalytics } from '~~/shared/@types/economy';

export const MOCK_ECONOMY_ANALYTICS: IEconomyAnalytics = {
    version: 1,
    updated_at: '2026-11-18T04:20:09.740Z',
    last_bank_sync_at: '2026-11-18T04:25:00.000Z',
    session_index: 3,
    totals: {
        total_money: 1538,
        bank_total: 1358,
        cash_total: 180,
    },
    bank: {
        total: 1358,
        accounts_count: 5,
        by_owner_type: {
            treasury: 850,
            player: 261,
            guild: 0,
            manufactory: 247,
        },
        accounts: {
            '0001': {
                owner_type: 'treasury',
                balance: 850,
            },
            '0002': {
                owner_type: 'player',
                owner_id: '11111111-1111-4111-8111-111111111111',
                owner_name: 'Aldric',
                balance: 156,
            },
            '0003': {
                owner_type: 'player',
                owner_id: '22222222-2222-4222-8222-222222222222',
                owner_name: 'Lyra',
                balance: 105,
            },
            '0004': {
                owner_type: 'guild',
                owner_id: 'smithy',
                balance: 0,
            },
            '0005': {
                owner_type: 'manufactory',
                owner_id: 'winery',
                balance: 247,
            },
        },
    },
    all_time: {
        emission_total: 808,
        sink_total: 279,
        net_change: 604,
        cash_to_bank_total: 186,
        bank_to_cash_total: 20,
        transfer_total: 610,
        manual_adjustment_net: 75,
        by_operation_type: {
            starting_items: {
                count: 2,
                amount: 122,
            },
            trade_sell: {
                count: 2,
                amount: 138,
            },
            trade_buy: {
                count: 2,
                amount: 82,
            },
            guild_craft_fee: {
                count: 1,
                amount: 12,
            },
            bank_deposit: {
                count: 1,
                amount: 50,
            },
            bank_withdraw: {
                count: 1,
                amount: 20,
            },
            bank_transfer: {
                count: 2,
                amount: 102,
            },
            bank_tax: {
                count: 1,
                amount: 16,
            },
            guild_order_tax: {
                count: 1,
                amount: 20,
            },
            guild_order_leader: {
                count: 1,
                amount: 18,
            },
            guild_order_cash: {
                count: 1,
                amount: 180,
            },
            guild_points_purchase: {
                count: 2,
                amount: 104,
            },
            guild_treasury_transfer: {
                count: 2,
                amount: 92,
            },
            guild_treasury_burn: {
                count: 1,
                amount: 12,
            },
            real_estate_purchase: {
                count: 1,
                amount: 96,
            },
            election_fee: {
                count: 1,
                amount: 32,
            },
            city_challenge: {
                count: 1,
                amount: 128,
            },
            manufactory_forfeit: {
                count: 1,
                amount: 45,
            },
            council_salary: {
                count: 1,
                amount: 64,
            },
            council_prize: {
                count: 1,
                amount: 32,
            },
            manufactory_order: {
                count: 1,
                amount: 320,
            },
            manufactory_tax: {
                count: 1,
                amount: 48,
            },
            manufactory_expand: {
                count: 1,
                amount: 160,
            },
            guild_treasury_bonus: {
                count: 1,
                amount: 10,
            },
            bank_file_edit: {
                count: 2,
                amount: 125,
            },
        },
    },
    sessions: {
        1: {
            session_index: 1,
            started_at: '2026-11-16T11:00:00.000Z',
            updated_at: '2026-11-16T12:42:17.880Z',
            opening_total_money: 934,
            opening_bank_total: 934,
            opening_cash_total: 0,
            closing_total_money: 1274,
            closing_bank_total: 1086,
            closing_cash_total: 188,
            emission_total: 382,
            sink_total: 42,
            net_change: 340,
            cash_to_bank_total: 146,
            bank_to_cash_total: 20,
            transfer_total: 196,
            manual_adjustment_net: 0,
            by_flow_kind: {
                emission: {
                    count: 6,
                    amount: 382,
                },
                sink: {
                    count: 3,
                    amount: 42,
                },
                cash_to_bank: {
                    count: 3,
                    amount: 146,
                },
                bank_to_cash: {
                    count: 1,
                    amount: 20,
                },
                transfer: {
                    count: 4,
                    amount: 196,
                },
            },
            by_operation_type: {
                starting_items: {
                    count: 2,
                    amount: 122,
                },
                trade_sell: {
                    count: 1,
                    amount: 42,
                },
                trade_buy: {
                    count: 1,
                    amount: 18,
                },
                guild_craft_fee: {
                    count: 1,
                    amount: 12,
                },
                bank_deposit: {
                    count: 1,
                    amount: 50,
                },
                bank_withdraw: {
                    count: 1,
                    amount: 20,
                },
                bank_transfer: {
                    count: 1,
                    amount: 32,
                },
                bank_tax: {
                    count: 1,
                    amount: 16,
                },
                guild_order_tax: {
                    count: 1,
                    amount: 20,
                },
                guild_order_leader: {
                    count: 1,
                    amount: 18,
                },
                guild_order_cash: {
                    count: 1,
                    amount: 180,
                },
                guild_points_purchase: {
                    count: 1,
                    amount: 64,
                },
                guild_treasury_transfer: {
                    count: 1,
                    amount: 52,
                },
                guild_treasury_burn: {
                    count: 1,
                    amount: 12,
                },
                real_estate_purchase: {
                    count: 1,
                    amount: 96,
                },
                election_fee: {
                    count: 1,
                    amount: 32,
                },
            },
        },
        2: {
            session_index: 2,
            started_at: '2026-11-17T10:00:02.110Z',
            updated_at: '2026-11-17T11:42:50.108Z',
            opening_total_money: 1274,
            opening_bank_total: 1086,
            opening_cash_total: 188,
            closing_total_money: 1431,
            closing_bank_total: 1283,
            closing_cash_total: 148,
            emission_total: 330,
            sink_total: 173,
            net_change: 157,
            cash_to_bank_total: 40,
            bank_to_cash_total: 0,
            transfer_total: 414,
            manual_adjustment_net: 0,
            by_flow_kind: {
                sink: {
                    count: 2,
                    amount: 173,
                },
                transfer: {
                    count: 6,
                    amount: 414,
                },
                emission: {
                    count: 2,
                    amount: 330,
                },
                cash_to_bank: {
                    count: 1,
                    amount: 40,
                },
            },
            by_operation_type: {
                city_challenge: {
                    count: 1,
                    amount: 128,
                },
                manufactory_forfeit: {
                    count: 1,
                    amount: 45,
                },
                council_salary: {
                    count: 1,
                    amount: 64,
                },
                council_prize: {
                    count: 1,
                    amount: 32,
                },
                manufactory_order: {
                    count: 1,
                    amount: 320,
                },
                manufactory_tax: {
                    count: 1,
                    amount: 48,
                },
                manufactory_expand: {
                    count: 1,
                    amount: 160,
                },
                bank_transfer: {
                    count: 1,
                    amount: 70,
                },
                guild_points_purchase: {
                    count: 1,
                    amount: 40,
                },
                guild_treasury_transfer: {
                    count: 1,
                    amount: 40,
                },
                guild_treasury_bonus: {
                    count: 1,
                    amount: 10,
                },
            },
        },
        3: {
            session_index: 3,
            started_at: '2026-11-18T04:05:00.015Z',
            updated_at: '2026-11-18T04:20:09.740Z',
            opening_total_money: 1431,
            opening_bank_total: 1283,
            opening_cash_total: 148,
            closing_total_money: 1538,
            closing_bank_total: 1358,
            closing_cash_total: 180,
            emission_total: 96,
            sink_total: 64,
            net_change: 107,
            cash_to_bank_total: 0,
            bank_to_cash_total: 0,
            transfer_total: 0,
            manual_adjustment_net: 75,
            by_flow_kind: {
                manual_adjustment: {
                    count: 2,
                    amount: 125,
                },
                emission: {
                    count: 1,
                    amount: 96,
                },
                sink: {
                    count: 1,
                    amount: 64,
                },
            },
            by_operation_type: {
                bank_file_edit: {
                    count: 2,
                    amount: 125,
                },
                trade_sell: {
                    count: 1,
                    amount: 96,
                },
                trade_buy: {
                    count: 1,
                    amount: 64,
                },
            },
        },
    },
};

export const MOCK_ECONOMY_FILES = [
    {
        name: '2026-11-16.001.log',
        lines: [
            '2026-11-16T18:02:11.105+07:00 INFO economy.flow category="economy" message="Денежная операция" actor="Aldric" actor_uuid="11111111-1111-4111-8111-111111111111" amount=74 bank_total=934 cash_total=74 copper=10 flow_kind="emission" operation_type="starting_items" session_index=1 signed_amount=74 silver=2 to_type="cash" total_money=1008',
            '2026-11-16T18:05:40.220+07:00 INFO economy.flow category="economy" message="Денежная операция" actor="Lyra" actor_uuid="22222222-2222-4222-8222-222222222222" amount=48 bank_total=934 cash_total=122 copper=16 flow_kind="emission" operation_type="starting_items" session_index=1 signed_amount=48 silver=1 to_type="cash" total_money=1056',
            '2026-11-16T18:14:03.512+07:00 INFO economy.flow category="economy" message="Денежная операция" actor="Aldric" actor_uuid="11111111-1111-4111-8111-111111111111" amount=42 bank_total=934 cash_total=164 copper=10 flow_kind="emission" item_count=6 item_id="minecraft:wheat" operation_type="trade_sell" session_index=1 signed_amount=42 silver=1 table_id="bakery" to_type="cash" total_money=1098',
            '2026-11-16T18:16:28.804+07:00 INFO economy.flow category="economy" message="Денежная операция" actor="Aldric" actor_uuid="11111111-1111-4111-8111-111111111111" amount=18 bank_total=934 cash_total=146 copper=18 flow_kind="sink" from_type="cash" item_count=2 item_id="minecraft:bread" operation_type="trade_buy" session_index=1 signed_amount=-18 silver=0 table_id="bakery" total_money=1080',
            '2026-11-16T18:25:19.044+07:00 INFO economy.flow category="economy" message="Денежная операция" actor="Lyra" actor_uuid="22222222-2222-4222-8222-222222222222" amount=12 bank_total=934 cash_total=134 copper=12 flow_kind="sink" from_type="cash" item_id="eoc:iron_sword" operation_type="guild_craft_fee" organization_id="smithy" session_index=1 signed_amount=-12 silver=0 table_id="guild_anvil" total_money=1068',
            '2026-11-16T18:33:01.300+07:00 INFO economy.flow category="economy" message="Денежная операция" actor="Aldric" actor_uuid="11111111-1111-4111-8111-111111111111" amount=50 bank_total=984 cash_total=84 copper=18 flow_kind="cash_to_bank" from_type="cash" operation_type="bank_deposit" session_index=1 signed_amount=0 silver=1 to_account="0002" to_type="player" total_money=1068',
            '2026-11-16T18:40:15.610+07:00 INFO economy.flow category="economy" message="Денежная операция" actor="Lyra" actor_uuid="22222222-2222-4222-8222-222222222222" amount=20 bank_total=964 cash_total=104 copper=20 flow_kind="bank_to_cash" from_account="0003" from_type="player" operation_type="bank_withdraw" session_index=1 signed_amount=0 silver=0 to_type="cash" total_money=1068',
            '2026-11-16T18:45:52.901+07:00 INFO economy.flow category="economy" message="Денежная операция" actor="Aldric" actor_uuid="11111111-1111-4111-8111-111111111111" amount=32 bank_total=964 cash_total=104 copper=0 flow_kind="transfer" from_account="0002" from_type="player" operation_type="bank_transfer" session_index=1 signed_amount=0 silver=1 to_account="0003" to_type="player" total_money=1068',
            '2026-11-16T18:48:10.115+07:00 INFO economy.flow category="economy" message="Денежная операция" actor="Lyra" actor_uuid="22222222-2222-4222-8222-222222222222" amount=16 bank_total=964 cash_total=104 copper=16 flow_kind="transfer" from_account="0003" from_type="player" operation_type="bank_tax" session_index=1 signed_amount=0 silver=0 to_account="0001" to_type="treasury" total_money=1068',
            '2026-11-16T19:04:11.400+07:00 INFO economy.flow category="economy" message="Денежная операция" actor="Lyra" actor_uuid="22222222-2222-4222-8222-222222222222" amount=20 bank_total=984 cash_total=104 copper=20 flow_kind="emission" operation_type="guild_order_tax" order_id=7 organization_id="smithy" session_index=1 signed_amount=20 silver=0 to_account="0001" to_type="treasury" total_money=1088',
            '2026-11-16T19:04:11.412+07:00 INFO economy.flow category="economy" message="Денежная операция" actor="Lyra" actor_uuid="22222222-2222-4222-8222-222222222222" amount=18 bank_total=1002 cash_total=104 copper=18 flow_kind="emission" operation_type="guild_order_leader" order_id=7 organization_id="smithy" session_index=1 signed_amount=18 silver=0 to_account="0002" to_type="player" total_money=1106',
            '2026-11-16T19:04:11.425+07:00 INFO economy.flow category="economy" message="Денежная операция" actor="Lyra" actor_uuid="22222222-2222-4222-8222-222222222222" amount=180 bank_total=1002 cash_total=284 copper=20 flow_kind="emission" operation_type="guild_order_cash" order_id=7 organization_id="smithy" session_index=1 signed_amount=180 silver=5 to_type="cash" total_money=1286',
            '2026-11-16T19:15:33.770+07:00 INFO economy.flow category="economy" message="Денежная операция" actor="Lyra" actor_uuid="22222222-2222-4222-8222-222222222222" amount=64 bank_total=1066 cash_total=220 copper=0 flow_kind="cash_to_bank" from_type="cash" operation_type="guild_points_purchase" organization_id="smithy" session_index=1 signed_amount=0 silver=2 to_account="0004" to_type="guild" total_money=1286',
            '2026-11-16T19:22:08.500+07:00 INFO economy.flow category="economy" message="Денежная операция" amount=52 bank_total=1066 cash_total=220 copper=20 flow_kind="transfer" from_account="0004" from_type="guild" operation_type="guild_treasury_transfer" organization_id="smithy" session_index=1 signed_amount=0 silver=1 to_account="0001" to_type="treasury" total_money=1286',
            '2026-11-16T19:22:08.505+07:00 INFO economy.flow category="economy" message="Денежная операция" amount=12 bank_total=1054 cash_total=220 copper=12 flow_kind="sink" from_account="0004" from_type="guild" operation_type="guild_treasury_burn" organization_id="smithy" session_index=1 signed_amount=-12 silver=0 total_money=1274',
            '2026-11-16T19:35:44.019+07:00 INFO economy.flow category="economy" message="Денежная операция" actor="Aldric" actor_uuid="11111111-1111-4111-8111-111111111111" address="ул. Торговая, д. 4" amount=96 bank_total=1054 cash_total=220 copper=0 flow_kind="transfer" from_account="0002" from_type="player" operation_type="real_estate_purchase" session_index=1 signed_amount=0 silver=3 to_account="0001" to_type="treasury" total_money=1274',
            '2026-11-16T19:42:17.880+07:00 INFO economy.flow category="economy" message="Денежная операция" actor="Aldric" actor_uuid="11111111-1111-4111-8111-111111111111" amount=32 bank_total=1086 cash_total=188 copper=0 flow_kind="cash_to_bank" from_type="cash" operation_type="election_fee" session_index=1 signed_amount=0 silver=1 to_account="0001" to_type="treasury" total_money=1274',
        ],
    },
    {
        name: '2026-11-17.001.log',
        lines: [
            '2026-11-17T17:00:02.110+07:00 INFO economy.flow category="economy" message="Денежная операция" amount=128 bank_total=958 cash_total=188 challenge_id="city_wall_repair" copper=0 flow_kind="sink" from_account="0001" from_type="treasury" operation_type="city_challenge" session_index=2 signed_amount=-128 silver=4 total_money=1146',
            '2026-11-17T17:00:02.215+07:00 INFO economy.flow category="economy" message="Денежная операция" amount=45 bank_total=913 cash_total=188 copper=13 flow_kind="sink" from_account="0005" from_type="manufactory" operation_type="manufactory_forfeit" order_id=11 organization_id="winery" session_index=2 signed_amount=-45 silver=1 total_money=1101',
            '2026-11-17T17:00:02.340+07:00 INFO economy.flow category="economy" message="Денежная операция" actor="Aldric" actor_uuid="11111111-1111-4111-8111-111111111111" amount=64 bank_total=913 cash_total=188 copper=0 flow_kind="transfer" from_account="0001" from_type="treasury" operation_type="council_salary" session_index=2 signed_amount=0 silver=2 to_account="0002" to_type="player" total_money=1101',
            '2026-11-17T17:00:02.410+07:00 INFO economy.flow category="economy" message="Денежная операция" actor="Aldric" actor_uuid="11111111-1111-4111-8111-111111111111" amount=32 bank_total=913 cash_total=188 copper=0 flow_kind="transfer" from_account="0001" from_type="treasury" operation_type="council_prize" session_index=2 signed_amount=0 silver=1 to_account="0002" to_type="player" total_money=1101',
            '2026-11-17T17:45:19.004+07:00 INFO economy.flow category="economy" message="Денежная операция" amount=320 bank_total=1233 cash_total=188 copper=0 flow_kind="emission" operation_type="manufactory_order" order_id=12 organization_id="winery" session_index=2 signed_amount=320 silver=10 to_account="0005" to_type="manufactory" total_money=1421',
            '2026-11-17T17:52:41.520+07:00 INFO economy.flow category="economy" message="Денежная операция" amount=48 bank_total=1233 cash_total=188 copper=16 flow_kind="transfer" from_account="0005" from_type="manufactory" operation_type="manufactory_tax" organization_id="winery" session_index=2 signed_amount=0 silver=1 to_account="0001" to_type="treasury" total_money=1421',
            '2026-11-17T18:05:11.670+07:00 INFO economy.flow category="economy" message="Денежная операция" amount=160 bank_total=1233 cash_total=188 copper=0 flow_kind="transfer" from_account="0005" from_type="manufactory" operation_type="manufactory_expand" organization_id="winery" session_index=2 signed_amount=0 silver=5 to_account="0001" to_type="treasury" total_money=1421',
            '2026-11-17T18:18:04.205+07:00 INFO economy.flow category="economy" message="Денежная операция" actor="Aldric" actor_uuid="11111111-1111-4111-8111-111111111111" amount=70 bank_total=1233 cash_total=188 copper=6 flow_kind="transfer" from_account="0005" from_type="manufactory" operation_type="bank_transfer" organization_id="winery" session_index=2 signed_amount=0 silver=2 to_account="0003" to_type="player" total_money=1421',
            '2026-11-17T18:30:12.900+07:00 INFO economy.flow category="economy" message="Денежная операция" actor="Lyra" actor_uuid="22222222-2222-4222-8222-222222222222" amount=40 bank_total=1273 cash_total=148 copper=8 flow_kind="cash_to_bank" from_type="cash" operation_type="guild_points_purchase" organization_id="smithy" session_index=2 signed_amount=0 silver=1 to_account="0004" to_type="guild" total_money=1421',
            '2026-11-17T18:42:50.100+07:00 INFO economy.flow category="economy" message="Денежная операция" amount=40 bank_total=1273 cash_total=148 copper=8 flow_kind="transfer" from_account="0004" from_type="guild" operation_type="guild_treasury_transfer" organization_id="smithy" session_index=2 signed_amount=0 silver=1 to_account="0001" to_type="treasury" total_money=1421',
            '2026-11-17T18:42:50.108+07:00 INFO economy.flow category="economy" message="Денежная операция" amount=10 bank_total=1283 cash_total=148 copper=10 flow_kind="emission" operation_type="guild_treasury_bonus" organization_id="smithy" session_index=2 signed_amount=10 silver=0 to_account="0001" to_type="treasury" total_money=1431',
        ],
    },
    {
        name: '2026-11-18.001.log',
        lines: [
            '2026-11-18T11:05:00.015+07:00 INFO economy.flow category="economy" message="Денежная операция" account="0001" amount=100 balance_after=850 balance_before=750 bank_total=1383 cash_total=148 copper=4 flow_kind="manual_adjustment" operation_type="bank_file_edit" owner_type="treasury" session_index=3 signed_amount=100 silver=3 total_money=1531',
            '2026-11-18T11:05:00.022+07:00 INFO economy.flow category="economy" message="Денежная операция" account="0003" amount=25 balance_after=105 balance_before=130 bank_total=1358 cash_total=148 copper=25 flow_kind="manual_adjustment" operation_type="bank_file_edit" owner_id="22222222-2222-4222-8222-222222222222" owner_name="Lyra" owner_type="player" session_index=3 signed_amount=-25 silver=0 total_money=1506',
            '2026-11-18T11:12:44.310+07:00 INFO economy.flow category="economy" message="Денежная операция" actor="Garrick" actor_uuid="33333333-3333-4333-8333-333333333333" amount=96 bank_total=1358 cash_total=244 copper=0 flow_kind="emission" item_count=2 item_id="eoc:iron_dagger" operation_type="trade_sell" session_index=3 signed_amount=96 silver=3 table_id="weaponsmith" to_type="cash" total_money=1602',
            '2026-11-18T11:20:09.740+07:00 INFO economy.flow category="economy" message="Денежная операция" actor="Garrick" actor_uuid="33333333-3333-4333-8333-333333333333" amount=64 bank_total=1358 cash_total=180 copper=0 flow_kind="sink" from_type="cash" item_count=1 item_id="eoc:weak_healing_potion" operation_type="trade_buy" session_index=3 signed_amount=-64 silver=2 table_id="alchemist" total_money=1538',
        ],
    },
];
