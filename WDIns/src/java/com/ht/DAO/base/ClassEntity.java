package com.ht.DAO.base;

public class ClassEntity {

	@SuppressWarnings("rawtypes")
	public ClassEntity(String entityName, Class entityClass) {
		this.entityName = entityName;
		this.entityClass = entityClass;
	}

	public ClassEntity() {
	}

	public ClassEntity addAlias(String entityName) {
		this.entityName = entityName;
		return this;
	}

	public <T> ClassEntity addClass(Class<T> entityClass) {
		this.entityClass = entityClass;
		return this;
	}

	public <T> ClassEntity add(String aliasName, Class<T> entityClass) {
		this.entityClass = entityClass;
		this.entityName = aliasName;
		return this;
	}

	public static ClassEntity create() {
		return new ClassEntity();
	}

	public static <T> ClassEntity createAndAdd(String aliasName, Class<T> entityClass) {
		return new ClassEntity(aliasName, entityClass);
	}

	String entityName;
	@SuppressWarnings("rawtypes")
	Class entityClass;
}
