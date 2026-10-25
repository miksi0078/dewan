-- OPTIONAL: two sample poets so your site isn't empty on day one.
-- You can edit or delete them later from the Admin panel.
insert into public.poets (name_ps, name_pr, name_en, born, died, bio_en)
select 'رحمان بابا', 'Rahman Baba', 'Rahman Baba', 'c. 1650', 'c. 1715',
       'Rahman Baba is one of the most beloved Pashto Sufi poets, remembered for verses on love, humanity and spiritual longing. (Sample entry: edit this biography from the Admin panel.)'
where not exists (select 1 from public.poets where name_en = 'Rahman Baba');

insert into public.poets (name_ps, name_pr, name_en, born, died, bio_en)
select 'خوشحال خان خټک', 'Khushal Khan Khattak', 'Khushal Khan Khattak', '1613', '1689',
       'Khushal Khan Khattak was a warrior, chieftain and one of the most celebrated poets in Pashto literature. (Sample entry: edit this biography from the Admin panel.)'
where not exists (select 1 from public.poets where name_en = 'Khushal Khan Khattak');
