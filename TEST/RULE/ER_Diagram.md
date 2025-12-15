erDiagram
    PATIENT_INFO {
        INT     patient_id PK
        INT     age
        VARCHAR sex
        VARCHAR occupation
        VARCHAR residence_area
        BOOLEAN diabetes
        BOOLEAN immunosuppressed
        VARCHAR onset_duration
        BOOLEAN pregnant
        BOOLEAN breastfeeding
        BOOLEAN HIV_status
    }

    RISK_FACTOR_ASSESSMENT {
        INT     id PK
        INT     patient_id FK
        VARCHAR hygiene_level
        BOOLEAN skin_trauma
        BOOLEAN hot_humid_environment
        BOOLEAN occlusive_clothing
        BOOLEAN hyperhidrosis
        BOOLEAN oily_skin
        BOOLEAN close_contact_tb_leprosy
        BOOLEAN mycobacteria_cross_immunity
        VARCHAR overall_infection_risk
        VARCHAR acne_inducing_drug_history
        VARCHAR chemical_exposure
        ENUM    leprosy_risk_group
        INT     time_from_exposure_to_symptoms_in_years
    }

    SKIN_LESION_MORPHOLOGY {
        INT     id PK
        INT     patient_id FK
        BOOLEAN vesicle_or_bulla
        BOOLEAN crust_presence
        VARCHAR crust_color
        BOOLEAN pustule
        BOOLEAN nodule_or_abscess
        BOOLEAN exfoliative_erythema
        BOOLEAN tuberculous_plaque
        BOOLEAN leprosy_patch
        BOOLEAN sensory_loss_on_lesion
        BOOLEAN scar
        BOOLEAN comedones_present
        BOOLEAN ulceration
        ENUM    primary_lesion
        SET     chronic_inflamation_features
        SET     visual_features
        ENUM    lymph_node
        BOOLEAN patch_type
        VARCHAR patch_color
        BOOLEAN plaque_type
        BOOLEAN diffuse_infiltration
        BOOLEAN borderline_features_between_T_and_L
    }

    LESION_DISTRIBUTION {
        INT     id PK
        INT     patient_id FK
        VARCHAR main_location
        BOOLEAN typical_for_disease
        BOOLEAN follicular_area
        BOOLEAN seborrheic_area
        BOOLEAN extremities_involved
        VARCHAR number_of_lesions
        VARCHAR border_clarity
        VARCHAR symmetry
    }

    SYSTEMIC_AND_NEURO_SIGNS {
        INT     id PK
        INT     patient_id FK
        BOOLEAN fever
        BOOLEAN pain
        BOOLEAN pruritus
        BOOLEAN malaise
        BOOLEAN hair_loss
        ENUM    center_sensation
        BOOLEAN temperature_or_pain_sensation_loss_on_lesion
        BOOLEAN enlarged_painful_nerves
    }

    LABORATORY_ASSESSMENT {
        INT     id PK
        INT     patient_id FK
        BOOLEAN smear_afb_leprosy
        VARCHAR other_myco_tests
        VARCHAR inflammatory_markers
        ENUM    bacteria_test
        ENUM    tuberculin_test
        ENUM    histopathology
        ENUM    leprosy_bacilloscopy_result
        ENUM    leprosy_Ziehl_Neelsen_smear
        INT     bacteriological_index
    }

    DIAGNOSIS_ASSESSMENT {
        INT     id PK
        INT     patient_id FK
        VARCHAR main_diagnosis
        VARCHAR diagnostic_certainty
        VARCHAR differential_list
        BOOLEAN complication_flag
        VARCHAR complication_type
        BOOLEAN cross_immunity_other_mycobacteria
        BOOLEAN early_detection
        VARCHAR etiologic_agent
        BOOLEAN leprosy_suspicion
        VARCHAR subtype
        VARCHAR confirmation_status
        VARCHAR WHO_group
        VARCHAR prognosis
    }

    SEVERITY_ASSESSMENT {
        INT     id PK
        INT     patient_id FK
        VARCHAR extent_of_lesions
        BOOLEAN systemic_involvement
        BOOLEAN deformity_or_disability
        VARCHAR overall_severity
        INT     noninflammatory_lesion_count
        INT     inflammatory_lesion_count
        INT     nodule_cyst_count
        INT     total_lesion_count
        BOOLEAN recurrent_infections
        ENUM    M_leprae_doubling_time
        ENUM    infectivity
        BOOLEAN muscle_atrophy_or_deformity_of_limbs
    }

    TREATMENT_PLAN {
        INT     id PK
        INT     patient_id FK
        VARCHAR local_antiseptic
        VARCHAR topical_antibiotic
        VARCHAR systemic_antibiotic
        BOOLEAN drainage_performed
        VARCHAR pain_relief
        VARCHAR antipruritic
        VARCHAR acne_regimen
        VARCHAR treatment_duration
        VARCHAR follow_up_schedule
        VARCHAR prevention_advice
        INT     regimen_choice
        VARCHAR regimen
        VARCHAR local_treatment
        BOOLEAN MDT_completed_as_recommended
        ENUM    leprosy_screening_and_contact_exam
    }

    %% QUAN HỆ: 1 bệnh nhân – 1 bộ đánh giá / điều trị
    PATIENT_INFO ||--o{ RISK_FACTOR_ASSESSMENT : "hasRiskFactors"
    PATIENT_INFO ||--o{ SKIN_LESION_MORPHOLOGY : "hasSkinLesions"
    PATIENT_INFO ||--o{ LESION_DISTRIBUTION : "hasDistributions"
    PATIENT_INFO ||--o{ SYSTEMIC_AND_NEURO_SIGNS : "hasSystemicSigns"
    PATIENT_INFO ||--o{ LABORATORY_ASSESSMENT : "hasLabResults"
    PATIENT_INFO ||--o{ DIAGNOSIS_ASSESSMENT : "hasDiagnoses"
    PATIENT_INFO ||--o{ SEVERITY_ASSESSMENT : "hasSeverityRecords"
    PATIENT_INFO ||--o{ TREATMENT_PLAN : "hasTreatmentPlans"

