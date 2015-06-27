package com.ht.DAO.base;

import org.hibernate.type.Type;

public class EntityJDBCByHibernate {

	public String attrName;
	public String dbColName;
	public boolean isIdentityCol = false;
	public boolean identifierAssignedByInsert = false;
	public Type fieldType;

	
	public boolean isNOTInsert(){
		
		if(identifierAssignedByInsert && isIdentityCol){
			return true;
		}
		
		return false;
		
	}
}